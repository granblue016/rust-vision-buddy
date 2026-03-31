
pub mod config;
pub mod modules;
pub mod services;
pub mod shared;

use axum::http::header;
use axum::http::{HeaderValue, Method};
use axum::Router;
use config::settings::Settings;
use modules::{ai, auth, content_generation, cv, health, scoring};
use shared::app_state::AppState;
use tower_http::cors::CorsLayer;

/// Hàm khởi tạo Router chính của ứng dụng.
/// Được đặt trong lib.rs để có thể gọi từ main.rs và các Integration Tests.
pub fn create_app(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:5173".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:5173".parse::<HeaderValue>().unwrap(),
            "http://localhost:3000".parse::<HeaderValue>().unwrap(),
            "http://localhost:8080".parse::<HeaderValue>().unwrap(),
        ])
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
            header::HeaderName::from_static("x-requested-with"),
        ])
        .expose_headers([
            header::CONTENT_DISPOSITION,
            header::CONTENT_TYPE,
            header::CONTENT_LENGTH,
        ])
        .allow_credentials(true);

    Router::new()
        .nest("/api/v1/auth", auth::routes())
        .nest("/api/v1/ai", ai::routes())
        .nest("/api/v1/scoring", scoring::routes())
        .nest("/api/v1/content", content_generation::routes())
        .nest("/api/v1/cvs", cv::routes())
        .merge(health::routes())
        .layer(cors)
        .with_state(state)
}
