use career_compass_backend::{
    config::settings::Settings,
    create_app,
    modules::content_generation,
    shared::{app_state::AppState, database},
};
use std::net::SocketAddr;
use tracing::{error, info};

#[tokio::main]
async fn main() {
    // 1. Khởi tạo logging
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    // Load cấu hình
    let settings = Settings::from_env().expect("🔥 Không thể tải cấu hình từ file .env");
    let host = settings.backend_host.clone();
    let port = settings.backend_port;

    // 2. Kết nối Database
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

    // 3. Chạy Migrations
    if let Err(err) = database::run_migrations(&db_pool).await {
        error!("❌ Lỗi chạy migrations: {}", err);
        std::process::exit(1);
    }

    // 4. Khởi tạo Template Engine
    if let Err(e) = content_generation::template_engine::init_templates() {
        error!("❌ Lỗi khởi tạo template engine: {}", e);
        std::process::exit(1);
    }

    // Tạo AppState và Router
    let state = AppState::new(settings, db_pool);
    let app = create_app(state);

    // 7. Chạy Server
    let addr_str = format!("{}:{}", host, port);
    let addr: SocketAddr = addr_str
        .parse()
        .unwrap_or_else(|_| "127.0.0.1:8080".parse().unwrap());

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    info!("🚀 Backend khởi động thành công tại: http://{}", addr);

    axum::serve(listener, app).await.unwrap();
}
