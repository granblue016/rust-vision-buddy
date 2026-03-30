use serde::{Deserialize, Serialize};

// ==========================================================
// 1. REQUEST/RESPONSE CHO FRONTEND (API ENDPOINTS)
// ==========================================================

#[derive(Debug, Deserialize)]
pub struct ChatAssistantRequest {
    pub message: String,
    pub jd_text: Option<String>,
    pub cv_summary: Option<String>,
    pub language: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ChatAssistantResponse {
    pub reply: String,
}

// Thêm Serialize ở đây để sửa lỗi E0277 khi gọi .json(&payload)
#[derive(Debug, Serialize, Deserialize)]
pub struct ScoreRequest {
    pub cv_text: String,
    pub jd_text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScoreResponse {
    pub score: f64,
    pub match_level: String,
    pub note: Option<String>,
}

// Bổ sung ChatMessage để sửa lỗi "no ChatMessage in modules::ai::models"
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

// ==========================================================
// 2. STRUCTS CHO GEMINI API (GOOGLE AI)
// ==========================================================

#[derive(Debug, Serialize)]
pub struct GeminiRequest {
    pub contents: Vec<GeminiContent>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeminiContent {
    pub role: Option<String>,
    pub parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeminiPart {
    pub text: String,
}

#[derive(Debug, Deserialize)]
pub struct GeminiResponse {
    pub candidates: Vec<GeminiCandidate>,
}

#[derive(Debug, Deserialize)]
pub struct GeminiCandidate {
    pub content: GeminiContentResponse,
}

#[derive(Debug, Deserialize)]
pub struct GeminiContentResponse {
    pub parts: Vec<GeminiPartResponse>,
}

#[derive(Debug, Deserialize)]
pub struct GeminiPartResponse {
    pub text: String,
}
