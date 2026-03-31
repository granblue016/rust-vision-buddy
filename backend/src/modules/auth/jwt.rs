use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};

use crate::{
    modules::auth::models::Claims,
    shared::{api_error::ApiError, app_state::AppState},
};

pub fn generate_access_token(email: &str, state: &AppState) -> Result<String, ApiError> {
    let exp = Utc::now() + Duration::minutes(state.settings.jwt_expires_minutes);
    let claims = Claims {
        sub: email.to_string(),
        exp: exp.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.settings.jwt_secret.as_bytes()),
    )
    .map_err(|_| ApiError::Internal)
}

pub fn validate_token(token: &str, state: &AppState) -> Result<Claims, ApiError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.settings.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map(|token_data| token_data.claims)
    .map_err(|_| ApiError::Unauthorized)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::settings::Settings;
    use std::collections::HashMap;
    use std::sync::Arc;
    use tokio::sync::RwLock;

    // Chuyển thành hàm async để có thể await nếu cần
    async fn setup_test_state() -> AppState {
        let settings = Settings {
            jwt_secret: "test_secret_key_at_least_32_chars_long".to_string(),
            jwt_expires_minutes: 60,
            ..Settings::default()
        };

        AppState {
            settings,
            // connect_lazy vẫn cần một context Tokio để thiết lập pool bên dưới
            db: sqlx::PgPool::connect_lazy("postgres://localhost/fake").unwrap(),
            http: reqwest::Client::new(),
            oauth_states: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    #[tokio::test] // THAY ĐỔI: Sử dụng tokio test thay vì test thường
    async fn test_generate_and_validate_token_success() {
        let state = setup_test_state().await;
        let email = "test@example.com";

        let token = generate_access_token(email, &state).expect("Failed to generate token");
        assert!(!token.is_empty());

        let result = validate_token(&token, &state).expect("Failed to validate token");
        assert_eq!(result.sub, email);
    }

    #[tokio::test] // THAY ĐỔI: Sử dụng tokio test
    async fn test_validate_invalid_token() {
        let state = setup_test_state().await;
        let invalid_token = "this.is.not.a.valid.token";

        let result = validate_token(invalid_token, &state);
        assert!(result.is_err());
    }
}
