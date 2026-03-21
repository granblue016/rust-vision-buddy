use crate::shared::app_state::AppState;
use axum::{
    routing::{delete, get, patch, post},
    Router,
};

pub mod handlers;
pub mod models;

/// Định nghĩa các API Routes cho module CV
/// Các đường dẫn này sẽ được nest vào "/api/v1/cvs" trong main.rs
pub fn routes() -> Router<AppState> {
    Router::new()
        // Các route xử lý trên danh sách (Tạo mới hoặc Lấy tất cả)
        .route("/", post(handlers::create_cv))
        .route("/", get(handlers::list_user_cvs))
        // Các route xử lý trên một CV cụ thể qua ID
        .route(
            "/:id",
            get(handlers::get_cv_by_id) // Load dữ liệu lên Editor
                .patch(handlers::update_cv) // Cập nhật (Auto-save)
                .delete(handlers::delete_cv), // Xóa CV
        )
}
