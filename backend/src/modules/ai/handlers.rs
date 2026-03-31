use crate::modules::ai::models::{
    ChatAssistantRequest, ChatAssistantResponse, GeminiContent, GeminiPart, GeminiRequest,
    GeminiResponse, ScoreRequest, ScoreResponse,
};
use crate::modules::auth;
use crate::shared::api_error::ApiError;
use crate::shared::app_state::AppState;
use axum::{extract::State, http::HeaderMap, Json};
use serde_json::Value;
use std::time::Duration;

// ==========================================================
// 1. HANDLER: CHAT ASSISTANT (GEMINI AI)
// ==========================================================
pub async fn chat_assistant(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<ChatAssistantRequest>,
) -> Result<Json<ChatAssistantResponse>, ApiError> {
    // --- Bước 1: Xác thực người dùng qua Bearer Token ---
    let raw = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(ApiError::Unauthorized)?;

    let token = raw.strip_prefix("Bearer ").ok_or(ApiError::Unauthorized)?;
    auth::service::validate_bearer_token(token, &state)?;

    // --- Bước 2: Xây dựng Prompt cho AI ---
    let language = payload.language.as_deref().unwrap_or("vi");
    let mut prompt = format!(
        "Bạn là chuyên gia tư vấn nghề nghiệp. Ngôn ngữ phản hồi: {}.\n",
        language
    );

    if let Some(jd) = &payload.jd_text {
        prompt.push_str(&format!("Mô tả công việc (JD): {}\n", jd));
    }
    if let Some(cv) = &payload.cv_summary {
        prompt.push_str(&format!("Tóm tắt CV: {}\n", cv));
    }
    prompt.push_str(&format!("Câu hỏi/Yêu cầu: {}", payload.message));

    // --- Bước 3: Gọi API Gemini ---
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
        .map_err(|e| ApiError::Upstream(format!("Lỗi kết nối Gemini: {}", e)))?;

    // --- Bước 4: Xử lý kết quả trả về ---
    let res_json = response
        .json::<GeminiResponse>()
        .await
        .map_err(|_| ApiError::Upstream("Lỗi dữ liệu từ Gemini".into()))?;

    let reply = res_json
        .candidates
        .first()
        .and_then(|c| c.content.parts.first())
        .map(|p| p.text.clone())
        .ok_or(ApiError::Internal)?;

    Ok(Json(ChatAssistantResponse { reply }))
}

// ==========================================================
// 2. HANDLER: SCORE CV (CƠ CHẾ AI + FALLBACK)
// ==========================================================
pub async fn score_cv(
    State(state): State<AppState>,
    Json(payload): Json<ScoreRequest>,
) -> Result<Json<ScoreResponse>, ApiError> {
    // Địa chỉ service Python NLP
    let nlp_url = "http://localhost:8000/score";

    // Cố gắng gọi sang Python NLP Service
    let nlp_result = state
        .http
        .post(nlp_url)
        .json(&payload) // Payload này đã được derive Serialize trong models.rs
        .timeout(Duration::from_secs(5))
        .send()
        .await;

    match nlp_result {
        // TRƯỜNG HỢP 1: Python Service phản hồi thành công
        Ok(res) if res.status().is_success() => {
            let data: Value = res.json().await.unwrap_or_default();
            Ok(Json(ScoreResponse {
                score: data["score"].as_f64().unwrap_or(0.0),
                match_level: data["match_level"]
                    .as_str()
                    .unwrap_or("Unknown")
                    .to_string(),
                note: Some("calculated_by_ai_nlp".to_string()),
            }))
        }

        // TRƯỜNG HỢP 2: FALLBACK - Khi Python sập hoặc lỗi kết nối
        _ => {
            tracing::warn!("⚠️ NLP Service unreachable. Using Baseline Scoring Fallback.");

            // Gọi hàm tính toán cơ bản bằng Rust
            let fallback_score = calculate_baseline_score(&payload.cv_text, &payload.jd_text);

            Ok(Json(ScoreResponse {
                score: fallback_score,
                match_level: if fallback_score > 60.0 {
                    "Good Match".into()
                } else if fallback_score > 30.0 {
                    "Average Match".into()
                } else {
                    "Needs Improvement".into()
                },
                note: Some("calculated_by_baseline_engine_fallback".to_string()),
            }))
        }
    }
}

// ==========================================================
// 3. UTILS: LOGIC TÍNH ĐIỂM DỰ PHÒNG (BASELINE)
// ==========================================================
/// Hàm này tính toán điểm dựa trên sự xuất hiện của các từ khóa quan trọng.
pub fn calculate_baseline_score(cv_text: &str, jd_text: &str) -> f64 {
    let cv_lower = cv_text.to_lowercase();
    let jd_lower = jd_text.to_lowercase();

    // Danh sách từ khóa trọng tâm của dự án
    let keywords = vec![
        "rust", "python", "react", "api", "backend", "frontend", "sql", "axum", "tokio",
    ];

    let mut matches = 0;
    for kw in &keywords {
        if cv_lower.contains(kw) && jd_lower.contains(kw) {
            matches += 1;
        }
    }

    if keywords.is_empty() {
        return 0.0;
    }
    (matches as f64 / keywords.len() as f64) * 100.0
}

// ==========================================================
// 4. UNIT TESTS
// ==========================================================
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_baseline_score_basic_match() {
        let cv = "Tôi là một Rust developer chuyên về Axum và Backend";
        let jd = "Chúng tôi cần tìm Rust developer làm Backend";
        let score = calculate_baseline_score(cv, jd);

        assert!(score > 0.0, "Điểm phải lớn hơn 0 khi có từ khóa trùng lặp");
    }

    #[test]
    fn test_calculate_baseline_score_no_match() {
        let cv = "Đầu bếp chuyên món Pháp";
        let jd = "Kỹ sư phần mềm hệ thống";
        let score = calculate_baseline_score(cv, jd);

        assert_eq!(
            score, 0.0,
            "Điểm phải bằng 0 khi không có từ khóa liên quan"
        );
    }
}
