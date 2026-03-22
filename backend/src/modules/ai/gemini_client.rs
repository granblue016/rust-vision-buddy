use crate::modules::ai::models::{GeminiContent, GeminiPart, GeminiRequest, GeminiResponse};
use crate::shared::api_error::ApiError;
use crate::shared::app_state::AppState;

pub async fn generate_text(state: &AppState, prompt: String) -> Result<String, ApiError> {
    // 1. Khởi tạo URL từ cấu hình
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        state.settings.gemini_model, state.settings.gemini_api_key
    );

    // 2. Xây dựng body request theo đúng format của Google
    let body = GeminiRequest {
        contents: vec![GeminiContent {
            role: None,
            parts: vec![GeminiPart { text: prompt }],
        }],
    };

    // 3. Thực hiện gọi API
    let response = state
        .http
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            eprintln!("🔥 Gemini Network Error: {:?}", e);
            // Sử dụng Upstream(String) vì đây là lỗi gọi service bên ngoài
            ApiError::Upstream("Không thể kết nối với dịch vụ Gemini AI".to_string())
        })?;

    // 4. Parse JSON kết quả (Thêm Turbofish ::<GeminiResponse> để tránh lỗi Infer Type)
    let res_json = response.json::<GeminiResponse>().await.map_err(|e| {
        eprintln!("🔥 Gemini Parse Error: {:?}", e);
        ApiError::Upstream("Lỗi định dạng dữ liệu trả về từ AI".to_string())
    })?;

    // 5. Trích xuất nội dung text từ cấu hình phân cấp của Google
    let output = res_json
        .candidates
        .get(0)
        .and_then(|c| c.content.parts.get(0))
        .map(|p| p.text.clone())
        .ok_or_else(|| {
            eprintln!("🔥 Gemini: Phản hồi trống từ Google API");
            // Sử dụng Internal vì đây là lỗi logic khi dữ liệu không như mong đợi
            ApiError::Internal
        })?;

    Ok(output)
}
