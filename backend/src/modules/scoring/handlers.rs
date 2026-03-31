use axum::{extract::State, http::HeaderMap, Json};

use crate::{
    modules::{
        auth,
        scoring::{models::{LegacyAnalyzeCvRequest, ScoreCvRequest}, service},
    },
    shared::{api_error::ApiError, api_response::ok, app_state::AppState},
};

pub async fn score_cv(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<ScoreCvRequest>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    // Xác thực người dùng
    validate_auth(&headers, &state)?;

    // Kiểm tra tính hợp lệ của đầu vào
    ensure_inputs(&payload.cv_text, &payload.jd_text)?;

    let language = payload.language.as_deref().unwrap_or("vi");

    let result = service::score_cv(&state, &payload.cv_text, &payload.jd_text, language).await?;

    Ok(ok(result))
}

pub async fn analyze_cv_legacy(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<LegacyAnalyzeCvRequest>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    // Xác thực người dùng
    validate_auth(&headers, &state)?;

    // Kiểm tra tính hợp lệ của đầu vào
    ensure_inputs(&payload.cv_text, &payload.jd_text)?;

    let language = payload.language.as_deref().unwrap_or("vi");
    let style = payload.template_style.as_deref().unwrap_or("formal");
    let mode = payload.mode.as_deref().unwrap_or("full");

    let result =
        service::analyze_cv_legacy(&state, &payload.cv_text, &payload.jd_text, language, style, mode)
            .await?;

    Ok(ok(result))
}

/// Hàm nội bộ để kiểm tra quyền truy cập dựa trên JWT Bearer Token
fn validate_auth(headers: &HeaderMap, state: &AppState) -> Result<(), ApiError> {
    let raw = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(ApiError::Unauthorized)?;

    let token = raw.strip_prefix("Bearer ").ok_or(ApiError::Unauthorized)?;

    // FIX: auth::service::validate_bearer_token trả về Result<String, ApiError> (email)
    // Chúng ta cần map sang Result<(), ApiError> để khớp với chữ ký hàm validate_auth
    auth::service::validate_bearer_token(token, state).map(|_| ())
}

/// Kiểm tra sơ bộ độ dài văn bản để tránh gửi request rỗng hoặc quá ngắn lên AI
fn ensure_inputs(cv_text: &str, jd_text: &str) -> Result<(), ApiError> {
    if cv_text.trim().len() < 30 {
        return Err(ApiError::BadRequest(
            "CV text is too short or unreadable. Please provide more details.".to_string(),
        ));
    }

    if jd_text.trim().len() < 20 {
        return Err(ApiError::BadRequest(
            "Job description is too short. Please provide a full job description.".to_string(),
        ));
    }

    Ok(())
}
