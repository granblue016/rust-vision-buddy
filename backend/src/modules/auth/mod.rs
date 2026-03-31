use axum::{routing::{get, post}, Router};
use crate::shared::app_state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(handlers::register))
        .route("/login", post(handlers::login))
        .route("/logout", post(handlers::logout))
        // OAuth routes
        .route("/google/login", get(handlers::google_login))
        .route("/google/callback", get(handlers::google_callback))
        .route("/github/login", get(handlers::github_login))
        .route("/github/callback", get(handlers::github_callback))
}

mod handlers;
mod jwt;
pub mod models;
pub mod service;
pub mod repository; // ĐÃ THÊM: Khai báo để Handler và AppState có thể sử dụng SqlxAuthRepository
mod oauth;
