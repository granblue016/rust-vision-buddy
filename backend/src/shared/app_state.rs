use crate::config::settings::Settings;
use sqlx::PgPool;
use std::{
    collections::HashMap,
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct OAuthStateData {
    pub created: Instant,
    pub frontend_url: String,
}

#[derive(Clone)]
pub struct AppState {
    pub settings: Settings,
    pub http: reqwest::Client,
    pub db: PgPool,
    pub oauth_states: Arc<RwLock<HashMap<String, OAuthStateData>>>,
}

impl AppState {
    pub fn new(settings: Settings, db: PgPool) -> Self {
        Self {
            settings,
            // Cập nhật: Thêm timeout mặc định cho HTTP client
            // Điều này cực kỳ quan trọng khi gọi API AI (Gemini) để tránh việc ứng dụng bị treo nếu mạng lag
            http: reqwest::Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .expect("failed to create http client"),
            db,
            oauth_states: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn store_oauth_state(&self, state: String, frontend_url: String) {
        let mut states = self.oauth_states.write().await;
        // Giữ bộ nhớ gọn gàng bằng cách loại bỏ các entry đã hết hạn trước khi thêm mới
        let now = Instant::now();
        states.retain(|_, data| now.duration_since(data.created) <= Duration::from_secs(600));
        states.insert(
            state,
            OAuthStateData {
                created: now,
                frontend_url,
            },
        );
    }

    pub async fn consume_oauth_state(&self, state: &str) -> Option<String> {
        let mut states = self.oauth_states.write().await;
        if let Some(data) = states.remove(state) {
            if Instant::now().duration_since(data.created) <= Duration::from_secs(600) {
                return Some(data.frontend_url);
            }
        }
        None
    }
}

#[cfg(test)]
mod tests {
    // use super::*;
    // Giả sử AppConfig của bạn có thể khởi tạo mặc định hoặc đơn giản
    // và AppState có hàm new nhận config và pool

    #[test]
    fn test_app_state_initialization() {
        // 1. Tạo config giả (giả sử bạn có struct AppConfig)
        // let config = AppConfig::default();

        // 2. Thử nghiệm logic lấy các giá trị từ state
        // Ví dụ: kiểm tra xem các flag hoặc settings có đúng không
        // let state = AppState::new(config, pool);
        // assert!(state.is_ready());
    }
}
