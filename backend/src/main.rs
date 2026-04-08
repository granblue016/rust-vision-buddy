mod config;
mod modules;
mod services;
mod shared;

use axum::http::header;
use axum::http::{HeaderValue, Method};
use axum::Router;
use config::settings::Settings;
use modules::{ai, auth, content_generation, cv, health, scoring};
use shared::{app_state::AppState, database};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing::{error, info};

#[tokio::main]
async fn main() {
    // 1. Khởi tạo logging (sử dụng RUST_LOG từ .env)
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    // Load cấu hình từ môi trường
    let settings = Settings::from_env().expect("🔥 Không thể tải cấu hình từ file .env");
    let host = settings.backend_host.clone();
    let port = settings.backend_port;

    // 2. Kết nối Database PostgreSQL
    info!("🔌 Đang kết nối Database...");
    let db_pool = match database::create_pool(&settings.database_url).await {
        Ok(pool) => {
            info!("✅ Kết nối Database thành công!");
            pool
        }
        Err(err) => {
            error!("❌ Lỗi kết nối Database: {}", err);
            std::process::exit(1);
        }
    };

    // 3. Tự động chạy Migrations
    info!("⚙️ Đang kiểm tra và chạy Migrations...");
    if let Err(err) = database::run_migrations(&db_pool).await {
        error!("❌ Lỗi chạy migrations: {}", err);
        std::process::exit(1);
    }

    // 4. Khởi tạo Template Engine
    if let Err(e) = content_generation::template_engine::init_templates() {
        error!("❌ Lỗi khởi tạo template engine: {}", e);
        std::process::exit(1);
    }

    // Tạo AppState chung
    let state = AppState::new(settings, db_pool);

    // 5. Cấu hình CORS - Mở rộng để hỗ trợ tải file mượt mà
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:5173".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:5173".parse::<HeaderValue>().unwrap(),
            "http://localhost:3000".parse::<HeaderValue>().unwrap(),
            "http://localhost:8080".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:8080".parse::<HeaderValue>().unwrap(),
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
        // QUAN TRỌNG: Cho phép Frontend đọc header để lấy tên file PDF
        .expose_headers([
            header::CONTENT_DISPOSITION,
            header::CONTENT_TYPE,
            header::CONTENT_LENGTH,
        ])
        .allow_credentials(true);

    // 6. Xây dựng Router chính
    let app = Router::new()
        .nest("/api/v1/auth", auth::routes())
        .nest("/api/v1/ai", ai::routes())
        .nest("/api/v1/scoring", scoring::routes())
        .nest("/api/v1/content", content_generation::routes())
        .nest("/api/v1/cvs", cv::routes()) // Router chứa export_pdf
        .merge(health::routes())
        .layer(cors)
        .with_state(state);

    // 7. Chạy Server
    let addr_str = format!("{}:{}", host, port);
    let addr: SocketAddr = addr_str.parse().unwrap_or_else(|_| {
        error!(
            "❌ Địa chỉ {} không hợp lệ. Đang dùng mặc định 127.0.0.1:8080",
            addr_str
        );
        "127.0.0.1:8080".parse().unwrap()
    });

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|err| {
            error!("❌ Không thể bind vào địa chỉ {}: {}", addr, err);
            std::process::exit(1);
        });

    info!("🚀 Backend khởi động thành công tại: http://{}", addr);

    if let Err(e) = axum::serve(listener, app).await {
        error!("🔥 Lỗi Server: {}", e);
    }
}
