use axum::{
    extract::{Query as AxQuery, State as AxState},
    http::HeaderMap,
    response::{Html, IntoResponse, Redirect, Response},
    Json,
};

use crate::{
    modules::auth::{
        models::{
            AuthProvider, LoginRequest, LoginResponse, LogoutResponse, OAuthCallbackRequest,
            OAuthInitResponse, RegisterRequest, RegisterResponse,
        },
        oauth, service,
        repository::SqlxAuthRepository,
    },
    shared::{api_error::ApiError, api_response::ok, app_state::AppState},
};

// --- Email/Password Handlers ---

pub async fn register(
    AxState(state): AxState<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let email = payload.email.trim().to_lowercase();
    let repo = SqlxAuthRepository { pool: state.db.clone() };

    // service::register trả về Result<User, ApiError>
    let _user = service::register(&email, payload.password.trim(), &repo).await?;

    Ok(ok(RegisterResponse {
        message: "Registered successfully",
        email,
    }))
}

pub async fn login(
    AxState(state): AxState<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let email = payload.email.trim().to_lowercase();
    let repo = SqlxAuthRepository { pool: state.db.clone() };

    // Xác thực thông tin đăng nhập
    let _user = service::validate_credentials(&email, payload.password.trim(), &repo).await?;

    // Tạo JWT token
    let token = service::login(&email, &state)?;

    Ok(ok(LoginResponse {
        access_token: token,
        token_type: "Bearer",
        expires_in_minutes: state.settings.jwt_expires_minutes,
    }))
}

pub async fn logout(
    AxState(state): AxState<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, ApiError> {
    let token = extract_bearer(&headers)?;

    // Kiểm tra token hợp lệ (nếu cần xử lý blacklist token thì thực hiện ở đây)
    service::validate_bearer_token(&token, &state)?;

    Ok(ok(LogoutResponse {
        message: "Logged out successfully",
    }))
}

// --- OAuth Handlers ---

pub async fn google_login(
    AxState(state): AxState<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, ApiError> {
    let (auth_url, csrf_token) = oauth::generate_google_auth_url(&state)?;
    let frontend_url = extract_frontend_url(&headers, &state);

    // Lưu state để chống CSRF và quay lại đúng URL frontend
    state.store_oauth_state(csrf_token, frontend_url).await;

    Ok(ok(OAuthInitResponse {
        authorization_url: auth_url,
    }))
}

pub async fn google_callback(
    AxState(state): AxState<AppState>,
    AxQuery(params): AxQuery<OAuthCallbackRequest>,
) -> Result<Response, ApiError> {
    // Kiểm tra state hợp lệ
    let frontend_url = validate_oauth_state(params.state.as_deref(), &state).await?;

    // Xử lý lỗi từ Google Provider
    if let Some(provider_error) = params.error.as_deref() {
        let description = params.error_description.as_deref().unwrap_or(provider_error);
        return Ok(build_oauth_error_bridge_response(&frontend_url, &state.settings.frontend_url, description));
    }

    let code = params.code.ok_or_else(|| ApiError::BadRequest("Missing auth code".into()))?;

    // Trao đổi code lấy user info
    let user_info = oauth::exchange_google_code(code, &state).await?;

    let repo = SqlxAuthRepository { pool: state.db.clone() };

    // Tìm hoặc tạo user mới từ Google info
    let user = service::find_or_create_oauth_user(
        &user_info.email,
        user_info.name.as_deref(),
        user_info.picture.as_deref(),
        &user_info.id,
        AuthProvider::Google,
        &repo,
    ).await?;

    // Tạo token đăng nhập
    let token = service::login(&user.email, &state)?;

    Ok(build_oauth_success_bridge_response(
        &frontend_url,
        &state.settings.frontend_url,
        &token,
        &user.email,
    ))
}

pub async fn github_login(
    AxState(state): AxState<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, ApiError> {
    let (auth_url, csrf_token) = oauth::generate_github_auth_url(&state)?;
    let frontend_url = extract_frontend_url(&headers, &state);
    state.store_oauth_state(csrf_token, frontend_url).await;

    Ok(ok(OAuthInitResponse {
        authorization_url: auth_url,
    }))
}

pub async fn github_callback(
    AxState(state): AxState<AppState>,
    AxQuery(params): AxQuery<OAuthCallbackRequest>,
) -> Result<Response, ApiError> {
    let frontend_url = validate_oauth_state(params.state.as_deref(), &state).await?;

    if let Some(provider_error) = params.error.as_deref() {
        let description = params.error_description.as_deref().unwrap_or(provider_error);
        return Ok(build_oauth_error_bridge_response(&frontend_url, &state.settings.frontend_url, description));
    }

    let code = params.code.ok_or_else(|| ApiError::BadRequest("Missing auth code".into()))?;
    let user_info = oauth::exchange_github_code(code, &state).await?;

    let repo = SqlxAuthRepository { pool: state.db.clone() };

    // GitHub có thể không trả về email nếu user set private
    let email = user_info.email.unwrap_or_else(|| format!("{}@github.local", user_info.login));

    let user = service::find_or_create_oauth_user(
        &email,
        user_info.name.as_deref(),
        user_info.avatar_url.as_deref(),
        &user_info.id.to_string(),
        AuthProvider::GitHub,
        &repo,
    ).await?;

    let token = service::login(&user.email, &state)?;

    Ok(build_oauth_success_bridge_response(
        &frontend_url,
        &state.settings.frontend_url,
        &token,
        &user.email,
    ))
}

// --- Internal Helpers ---

fn extract_bearer(headers: &HeaderMap) -> Result<String, ApiError> {
    headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|raw| raw.strip_prefix("Bearer "))
        .map(|token| token.to_string())
        .ok_or(ApiError::Unauthorized)
}

async fn validate_oauth_state(state_param: Option<&str>, state: &AppState) -> Result<String, ApiError> {
    let token = state_param
        .filter(|v| !v.trim().is_empty())
        .ok_or_else(|| ApiError::BadRequest("Missing OAuth state".into()))?;

    state.consume_oauth_state(token).await
        .ok_or_else(|| ApiError::BadRequest("Invalid or expired OAuth state".into()))
}

fn extract_frontend_url(headers: &HeaderMap, state: &AppState) -> String {
    let fallback = state.settings.frontend_url.trim_end_matches('/').to_string();

    headers
        .get("origin")
        .and_then(|v| v.to_str().ok())
        .map(str::trim)
        .filter(|origin| origin.starts_with("http://localhost") || origin.starts_with("http://127.0.0.1"))
        .map(|origin| origin.trim_end_matches('/').to_string())
        .unwrap_or(fallback)
}

fn build_oauth_success_bridge_response(
    preferred_frontend: &str,
    fallback_frontend: &str,
    token: &str,
    email: &str,
) -> Response {
    let candidates = oauth_frontend_candidates(preferred_frontend, fallback_frontend);
    let candidates_json = serde_json::to_string(&candidates).unwrap();
    let token_json = serde_json::to_string(token).unwrap();
    let email_json = serde_json::to_string(email).unwrap();

    let html = format!(
        r#"<!doctype html><html><head><title>Success</title></head><body><p>Completing sign-in...</p><script>
            const candidates = {candidates_json};
            const token = {token_json};
            const email = {email_json};
            const withPath = (base, path) => `${{base.replace(/\/$/, '')}}${{path}}`;
            async fn resolve() {{
                const query = `token=${{encodeURIComponent(token)}}&email=${{encodeURIComponent(email)}}`;
                for (const base of candidates) {{
                    try {{
                        await fetch(withPath(base, '/'), {{ mode: 'no-cors', cache: 'no-store' }});
                        window.location.replace(withPath(base, `/auth/callback?${{query}}`));
                        return;
                    }} catch (e) {{}}
                }}
                window.location.replace(withPath(candidates[0], `/auth/callback?${{query}}`));
            }}
            resolve();
        </script></body></html>"#
    );
    Html(html).into_response()
}

fn build_oauth_error_bridge_response(preferred_frontend: &str, fallback_frontend: &str, error: &str) -> Response {
    let candidates = oauth_frontend_candidates(preferred_frontend, fallback_frontend);
    let base = candidates.first().map(|s| s.as_str()).unwrap_or("http://localhost:8080");
    let redirect_url = format!("{}/auth?error={}", base.trim_end_matches('/'), urlencoding::encode(error));
    Redirect::to(&redirect_url).into_response()
}

fn oauth_frontend_candidates(preferred_frontend: &str, fallback_frontend: &str) -> Vec<String> {
    let mut candidates = Vec::new();
    for url in [preferred_frontend, fallback_frontend, "http://localhost:8080", "http://localhost:5173"] {
        let normalized = url.trim().trim_end_matches('/');
        if !normalized.is_empty() && !candidates.contains(&normalized.to_string()) {
            candidates.push(normalized.to_string());
        }
    }
    candidates
}
