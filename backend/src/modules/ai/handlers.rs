use crate::modules::ai::models::{
    ChatAssistantRequest, ChatAssistantResponse, GeminiContent, GeminiPart, GeminiRequest,
    GeminiResponse,
};
use crate::modules::auth;
use crate::shared::api_error::ApiError;
use crate::shared::app_state::AppState;
use axum::{extract::State, http::HeaderMap, Json};

// KHÔNG cần #[axum::debug_handler] nếu bạn chưa cài axum-macros
pub async fn chat_assistant(
    State(state): State<AppState>, // Bắt buộc dùng State extractor
    headers: HeaderMap,
    Json(payload): Json<ChatAssistantRequest>, // Json extractor phải nằm cuối
) -> Result<Json<ChatAssistantResponse>, ApiError> {
    // 1. Xác thực người dùng
    let raw = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(ApiError::Unauthorized)?;

    let token = raw.strip_prefix("Bearer ").ok_or(ApiError::Unauthorized)?;
    auth::service::validate_bearer_token(token, &state)?;

    // 2. Tạo nội dung gửi cho AI
    let language = payload.language.as_deref().unwrap_or("vi");
    let mut prompt = format!(
        "Bạn là chuyên gia tư vấn nghề nghiệp. Ngôn ngữ: {}.\n",
        language
    );

    if let Some(jd) = &payload.jd_text {
        prompt.push_str(&format!("JD: {}\n", jd));
    }
    if let Some(cv) = &payload.cv_summary {
        prompt.push_str(&format!("CV: {}\n", cv));
    }
    prompt.push_str(&format!("Yêu cầu: {}", payload.message));

    // 3. Gọi Gemini API
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        state.settings.gemini_model, state.settings.gemini_api_key
    );

    let body = GeminiRequest {
        contents: vec![GeminiContent {
            role: Some("user".to_string()),
            parts: vec![GeminiPart { text: prompt }],
        }],
    };

    let response = state
        .http
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            eprintln!("🔥 Network Error: {:?}", e);
            ApiError::Upstream("Lỗi kết nối AI".to_string())
        })?;

    // 4. Lấy kết quả (Dùng Turbofish ::<GeminiResponse> để tránh lỗi type annotation)
    let res_json = response.json::<GeminiResponse>().await.map_err(|e| {
        eprintln!("🔥 Parse Error: {:?}", e);
        ApiError::Upstream("Lỗi dữ liệu AI".to_string())
    })?;

    let reply = res_json
        .candidates
        .get(0)
        .and_then(|c| c.content.parts.get(0))
        .map(|p| p.text.clone())
        .ok_or(ApiError::Internal)?; // Khớp với variant Internal trong api_error.rs của bạn

    // 5. Trả về Json - Điều này giúp mod.rs hết lỗi Trait Bound
    Ok(Json(ChatAssistantResponse { reply }))
}
