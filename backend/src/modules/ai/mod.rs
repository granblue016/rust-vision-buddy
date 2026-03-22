use axum::{routing::post, Router};

// Import AppState từ shared để dùng làm kiểu dữ liệu cho Router
use crate::shared::app_state::AppState;

// Khai báo các module con bên trong thư mục ai
pub mod gemini_client;
pub mod handlers; // Để public để routes() bên dưới gọi được
pub mod models; // Để public cho các module khác dùng chung struct
pub mod prompt_templates;
pub mod service;

/// Hàm định nghĩa các route cho module AI
pub fn routes() -> Router<AppState> {
    Router::new()
        // Route chính cho trợ lý Chat AI
        .route("/chat-assistant", post(handlers::chat_assistant))
        // Các route hỗ trợ tương thích ngược (Backward compatibility)
        .route("/analyze-cv", post(scoring::analyze_cv_legacy))
        .route("/score-cv", post(scoring::score_cv))
        .route("/generate-email", post(content_generation::generate_email))
        .route(
            "/generate-cover-letter",
            post(content_generation::generate_cover_letter),
        )
}

// Giả định bạn có các module này trong cùng thư mục modules để route chạy được
use crate::modules::{content_generation, scoring};
