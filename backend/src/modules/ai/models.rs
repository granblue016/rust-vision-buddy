use serde::{Deserialize, Serialize};

// --- 1. Dữ liệu trao đổi với Frontend ---

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChatMessage {
    pub role: String, // "user" hoặc "model"
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct ChatAssistantRequest {
    pub message: String,
    pub language: Option<String>,
    pub jd_text: Option<String>,
    pub cv_summary: Option<String>,
    pub history: Option<Vec<ChatMessage>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatAssistantResponse {
    pub reply: String,
}

// --- 2. Cấu trúc nội bộ để map với Google Gemini API (Bắt buộc) ---

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

/// Struct để parse JSON từ Google trả về
#[derive(Debug, Deserialize)]
pub struct GeminiResponse {
    pub candidates: Vec<GeminiCandidate>,
}

#[derive(Debug, Deserialize)]
pub struct GeminiCandidate {
    pub content: GeminiContent,
}
