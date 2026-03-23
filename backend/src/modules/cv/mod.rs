use crate::shared::app_state::AppState;
use axum::{
    routing::{delete, get, post, put}, // Thêm put và delete vào import để tường minh
    Router,
};

pub mod handlers;
pub mod models;

pub fn routes() -> Router<AppState> {
    Router::new()
        // 1. Endpoint: /api/v1/cvs
        // POST: Tạo CV mới (Sẽ sinh UUID mới)
        // GET: Lấy danh sách CV của người dùng
        .route("/", post(handlers::create_cv).get(handlers::list_user_cvs))
        // 2. Endpoint: /api/v1/cvs/:id
        // :id yêu cầu định dạng UUID 36 ký tự
        .route(
            "/:id",
            get(handlers::get_cv_by_id) // Lấy chi tiết CV
                .put(handlers::update_cv) // CHỈNH SỬA: Dùng PUT thay vì PATCH để khớp với frontend
                .delete(handlers::delete_cv), // Xóa CV khỏi Database
        )
}
