use axum::{extract::State, http::HeaderMap, Json};

use crate::{
    modules::{
        auth,
        content_generation::{
            models::{GenerateCoverLetterRequest, GenerateEmailRequest},
            service,
        },
    },
    shared::{api_error::ApiError, api_response::ok, app_state::AppState},
};

pub async fn generate_email(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<GenerateEmailRequest>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    // Xác thực người dùng
    validate_auth(&headers, &state)?;

    // Kiểm tra tính hợp lệ của đầu vào
    ensure_inputs(&payload.cv_text, &payload.jd_text)?;

    let language = payload.language.as_deref().unwrap_or("vi");
    let style = payload.template_style.as_deref().unwrap_or("auto");

    let result =
        service::generate_email(&state, &payload.cv_text, &payload.jd_text, language, style).await?;

    Ok(ok(result))
}

pub async fn generate_cover_letter(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<GenerateCoverLetterRequest>,
) -> Result<impl axum::response::IntoResponse, ApiError> {
    // Xác thực người dùng
    validate_auth(&headers, &state)?;

    // Kiểm tra tính hợp lệ của đầu vào
    ensure_inputs(&payload.cv_text, &payload.jd_text)?;

    let language = payload.language.as_deref().unwrap_or("vi");
    let style = payload.template_style.as_deref().unwrap_or("auto");

    let result = service::generate_cover_letter(
        &state,
        &payload.cv_text,
        &payload.jd_text,
        language,
        style,
    )
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

    // FIX: validate_bearer_token trả về Result<String>, ta dùng .map(|_| ()) để chuyển thành Result<()>
    auth::service::validate_bearer_token(token, state).map(|_| ())
}

/// Kiểm tra sơ bộ độ dài văn bản để tránh gửi request rỗng lên AI Service
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
