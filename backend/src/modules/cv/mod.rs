use crate::shared::app_state::AppState;
use axum::{
    routing::{get, post},
    Router,
};

// Khai báo các module con trong cùng thư mục
pub mod handlers;
pub mod models;

/// Cấu hình các route cho module quản lý CV
/// Module này xử lý các tác vụ liên quan đến lưu trữ, truy vấn, cập nhật layout CV và xuất bản PDF
pub fn routes() -> Router<AppState> {
    Router::new()
        // --- Nhóm 1: Thao tác trên danh sách (Collection) ---
        // Path: / (thường được nest dưới /api/v1/cvs)
        .route(
            "/",
            post(handlers::create_cv) // POST: Tạo CV mới (Khởi tạo layout mặc định)
                .get(handlers::list_user_cvs), // GET: Lấy danh sách CV để hiển thị ở Dashboard
        )
        // --- Nhóm 2: Thao tác trên từng thực thể (Entity) ---
        // Path: /:id (Ví dụ: /api/v1/cvs/[uuid])
        .route(
            "/:id",
            get(handlers::get_cv_by_id) // GET: Lấy chi tiết layout_data để render editor
                .put(handlers::update_cv) // PUT: Lưu đè toàn bộ layout (Sử dụng cho Auto-save)
                .delete(handlers::delete_cv), // DELETE: Xóa CV
        )
        // --- Nhóm 3: Thao tác đặc biệt (Export) ---
        // Path: /:id/export (Ví dụ: /api/v1/cvs/[uuid]/export)
        .route(
            "/:id/export",
            get(handlers::export_cv_pdf), // GET: Kích hoạt render Headless Chrome để tải PDF
        )
}
