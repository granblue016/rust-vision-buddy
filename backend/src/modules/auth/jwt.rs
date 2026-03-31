use crate::{
    modules::auth::models::Claims,
    shared::{api_error::ApiError, app_state::AppState},
};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};

pub fn generate_access_token(email: &str, state: &AppState) -> Result<String, ApiError> {
    let now = Utc::now();
    let expiration = now + Duration::minutes(state.settings.jwt_expires_minutes);

    let claims = Claims {
        sub: email.to_owned(),
        exp: expiration.timestamp(), // Để mặc định i64, không ép kiểu usize
        iat: now.timestamp(),        // Thêm trường iat
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.settings.jwt_secret.as_bytes()),
    )
    .map_err(|e| {
        tracing::error!("JWT encode error: {:?}", e);
        ApiError::Internal
    })
}

pub fn validate_token(token: &str, state: &AppState) -> Result<Claims, ApiError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.settings.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map(|token_data| token_data.claims)
    .map_err(|e| {
        tracing::debug!("JWT decode error: {:?}", e);
        ApiError::Unauthorized
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::settings::Settings;
    use std::collections::HashMap;
    use std::sync::Arc;
    use tokio::sync::RwLock;

    async fn setup_test_state() -> AppState {
        let mut settings = Settings::default();
        // Secret key phải đủ dài (>= 32 chars) cho HS256
        settings.jwt_secret = "test_secret_key_at_least_32_chars_long_12345".to_string();
        settings.jwt_expires_minutes = 60;

        AppState {
            settings,
            // Sử dụng pool ảo cho unit test
            db: sqlx::PgPool::connect_lazy("postgres://localhost/fake").unwrap(),
            http: reqwest::Client::new(),
            oauth_states: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    #[tokio::test]
    async fn test_generate_and_validate_token_success() {
        let state = setup_test_state().await;
        let email = "test@example.com";

        let token = generate_access_token(email, &state).expect("Failed to generate token");
        assert!(!token.is_empty());

        let result = validate_token(&token, &state).expect("Failed to validate token");
        assert_eq!(result.sub, email);
        // Kiểm tra iat và exp có hợp lệ không
        assert!(result.exp > result.iat);
    }

    #[tokio::test]
    async fn test_validate_invalid_token() {
        let state = setup_test_state().await;
        let invalid_token = "header.payload.signature";

        let result = validate_token(invalid_token, &state);
        assert!(result.is_err());
    }
}
