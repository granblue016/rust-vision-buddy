use crate::modules::ai::models::{
    ChatAssistantRequest, ChatAssistantResponse, GeminiContent, GeminiPart, GeminiRequest,
    GeminiResponse,
};
use crate::modules::auth;
use crate::shared::api_error::ApiError;
use crate::shared::app_state::AppState;
use axum::{extract::State, http::HeaderMap, Json};
use serde_json::Value;

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

    // 4. Đọc raw body để xử lý được cả response thành công và response lỗi từ Gemini.
    let status = response.status();
    let raw_body = response.text().await.map_err(|e| {
        eprintln!("🔥 Read Body Error: {:?}", e);
        ApiError::Upstream("Không đọc được dữ liệu phản hồi từ AI".to_string())
    })?;

    if !status.is_success() {
        eprintln!("🔥 Gemini HTTP Error {}: {}", status, raw_body);
        let message = serde_json::from_str::<Value>(&raw_body)
            .ok()
            .and_then(|v| {
                v.get("error")
                    .and_then(|e| e.get("message"))
                    .and_then(|m| m.as_str().map(|s| s.to_string()))
            })
            .unwrap_or_else(|| "Gemini API trả về lỗi không xác định".to_string());

        return Err(ApiError::Upstream(format!("Gemini API error: {}", message)));
    }

    let res_json = serde_json::from_str::<GeminiResponse>(&raw_body).map_err(|e| {
        eprintln!("🔥 Parse Error: {:?}; body: {}", e, raw_body);
        ApiError::Upstream("AI trả về dữ liệu không đúng định dạng mong đợi".to_string())
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
