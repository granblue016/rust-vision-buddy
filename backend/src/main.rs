mod config;
mod modules;
mod shared;

use axum::http::{header, HeaderValue, Method};
use axum::Router;
use config::settings::Settings;
use modules::{ai, auth, content_generation, cv, health, scoring};
use shared::{app_state::AppState, database};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing::{error, info};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let settings = Settings::from_env().expect("failed to load settings");
    let host = settings.backend_host.clone();
    let port = settings.backend_port;

    // Khởi tạo kết nối Database
    info!("Connecting to database...");
    let db_pool = match database::create_pool(&settings.database_url).await {
        Ok(pool) => {
            info!("Database connection pool created successfully");
            pool
        }
        Err(err) => {
            error!("Failed to create database pool: {}", err);
            std::process::exit(1);
        }
    };

    // Chạy migrations để đảm bảo bảng 'cvs' tồn tại
    info!("Running database migrations...");
    if let Err(err) = database::run_migrations(&db_pool).await {
        error!("Failed to run database migrations: {}", err);
        std::process::exit(1);
    }

    // Khởi tạo engine tạo nội dung
    if let Err(e) = content_generation::template_engine::init_templates() {
        error!("Failed to initialize templates: {}", e);
        std::process::exit(1);
    }

    let state = AppState::new(settings, db_pool);

    // Cấu hình CORS chi tiết để tránh lỗi chặn trình duyệt
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:8080".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:8080".parse::<HeaderValue>().unwrap(),
            "http://localhost:5173".parse::<HeaderValue>().unwrap(),
        ])
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT]);

    // Build Router và gộp module CV
    let app = Router::new()
        .nest("/api/v1/auth", auth::routes())
        .nest("/api/v1/ai", ai::routes())
        .nest("/api/v1/scoring", scoring::routes())
        .nest("/api/v1/content", content_generation::routes())
        // Route này khớp với API_URL trong cvService.ts
        .nest("/api/v1/cv", cv::routes())
        .merge(health::routes())
        .layer(cors)
        .with_state(state);

    let addr: SocketAddr = format!("{host}:{port}")
        .parse()
        .expect("invalid BACKEND_HOST/BACKEND_PORT");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|err| {
            error!("Could not bind to {}: {}", addr, err);
            std::process::exit(1);
        });

    info!("🚀 Backend listening on http://{}", addr);

    axum::serve(listener, app).await.unwrap();
}
