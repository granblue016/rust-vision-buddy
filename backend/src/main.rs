mod config;
mod modules;
mod shared;

use axum::http::HeaderName as AxHeaderName;
use axum::http::{header, HeaderValue, Method};
use axum::Router;
use config::settings::Settings;
use modules::{ai, auth, content_generation, cv, health, scoring};
use shared::{app_state::AppState, database};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer}; // Thêm Any để linh hoạt nếu cần
use tracing::{error, info};

#[tokio::main]
async fn main() {
    // 1. Khởi tạo môi trường và logging
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    // Load cấu hình từ file .env (Thường là 127.0.0.1 và 8080)
    let settings = Settings::from_env().expect("failed to load settings");
    let host = settings.backend_host.clone();
    let port = settings.backend_port;

    // 2. Kết nối Database PostgreSQL
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

    // 3. Tự động chạy Migrations (Đảm bảo bảng 'cvs' và dữ liệu mẫu UUID luôn sẵn sàng)
    info!("Running database migrations...");
    if let Err(err) = database::run_migrations(&db_pool).await {
        error!("Failed to run database migrations: {}", err);
        std::process::exit(1);
    }

    // 4. Khởi tạo Engine (Templates cho CV)
    if let Err(e) = content_generation::template_engine::init_templates() {
        error!("Failed to initialize templates: {}", e);
        std::process::exit(1);
    }

    let state = AppState::new(settings, db_pool);

    // 5. Cấu hình CORS - Khắc phục triệt để lỗi kết nối từ Frontend Vite (Port 5173)
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:8080".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:8080".parse::<HeaderValue>().unwrap(),
            "http://localhost:5173".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:5173".parse::<HeaderValue>().unwrap(),
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
            // Khắc phục lỗi x-requested-with mà frontend gửi lên
            header::HeaderName::from_static("x-requested-with"),
        ])
        // Cho phép gửi credentials (nếu bạn dùng cookie sau này)
        .allow_credentials(true);

    // 6. Xây dựng Router - Khớp với các Service tại Frontend
    let app = Router::new()
        .nest("/api/v1/auth", auth::routes())
        .nest("/api/v1/ai", ai::routes())
        .nest("/api/v1/scoring", scoring::routes())
        .nest("/api/v1/content", content_generation::routes())
        // Route này sẽ xử lý các request như GET /api/v1/cvs/:id (UUID)
        .nest("/api/v1/cvs", cv::routes())
        .merge(health::routes())
        .layer(cors) // Quan trọng: Layer CORS phải nằm sau Router
        .with_state(state);

    // 7. Chạy Server
    let addr_str = format!("{}:{}", host, port);
    let addr: SocketAddr = addr_str.parse().unwrap_or_else(|_| {
        error!("Invalid address: {}", addr_str);
        "127.0.0.1:8080".parse().unwrap()
    });

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|err| {
            error!("Could not bind to {}: {}", addr, err);
            std::process::exit(1);
        });

    info!("🚀 Backend khởi động thành công tại: http://{}", addr);

    // Chạy vòng lặp server
    if let Err(e) = axum::serve(listener, app).await {
        error!("Server error: {}", e);
    }
}
