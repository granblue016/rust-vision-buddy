use crate::shared::app_state::AppState;
use axum::{
    routing::{get, post}, // Bỏ delete và patch ở đây vì ta gọi trực tiếp từ handler
    Router,
};

pub mod handlers;
pub mod models;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", post(handlers::create_cv).get(handlers::list_user_cvs))
        .route(
            "/:id",
            get(handlers::get_cv_by_id)
                .patch(handlers::update_cv) // Axum tự hiểu patch từ handler
                .delete(handlers::delete_cv), // Axum tự hiểu delete từ handler
        )
}
