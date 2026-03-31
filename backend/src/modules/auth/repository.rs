use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;
use crate::shared::api_error::ApiError;
use crate::modules::auth::models::{User, AuthProvider};
use super::service::AuthRepository;

pub struct SqlxAuthRepository {
    pub pool: PgPool,
}

#[async_trait]
impl AuthRepository for SqlxAuthRepository {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, ApiError> {
        sqlx::query_as!(
            User,
            r#"
            SELECT id, email, name, avatar_url,
                   provider as "provider: AuthProvider",
                   provider_id, password_hash, created_at, updated_at
            FROM users WHERE email = $1
            "#,
            email
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error finding user by email: {:?}", e);
            ApiError::Internal
        })
    }

    async fn find_by_provider(&self, provider: AuthProvider, provider_id: &str) -> Result<Option<User>, ApiError> {
        sqlx::query_as!(
            User,
            r#"
            SELECT id, email, name, avatar_url,
                   provider as "provider: AuthProvider",
                   provider_id, password_hash, created_at, updated_at
            FROM users WHERE provider = $1 AND provider_id = $2
            "#,
            provider as AuthProvider,
            provider_id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error finding user by provider: {:?}", e);
            ApiError::Internal
        })
    }

    async fn update_password_hash(&self, user_id: Uuid, new_hash: &str) -> Result<(), ApiError> {
        sqlx::query!(
            "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
            new_hash,
            user_id
        )
        .execute(&self.pool)
        .await
        .map(|_| ())
        .map_err(|e| {
            tracing::error!("Database error updating password hash: {:?}", e);
            ApiError::Internal
        })
    }

    async fn create_email_user(&self, email: &str, hash: &str) -> Result<User, ApiError> {
        sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (email, password_hash, provider)
            VALUES ($1, $2, 'email'::auth_provider)
            RETURNING id, email, name, avatar_url,
                      provider as "provider: AuthProvider",
                      provider_id, password_hash, created_at, updated_at
            "#,
            email,
            hash
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            if let Some(db_err) = e.as_database_error() {
                if db_err.is_unique_violation() {
                    return ApiError::BadRequest("Email already exists".to_string());
                }
            }
            tracing::error!("Database error creating email user: {:?}", e);
            ApiError::Internal
        })
    }

    async fn create_oauth_user(
        &self,
        email: &str,
        name: Option<&str>,
        avatar: Option<&str>,
        provider: AuthProvider,
        provider_id: &str
    ) -> Result<User, ApiError> {
        sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (email, name, avatar_url, provider, provider_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, name, avatar_url,
                      provider as "provider: AuthProvider",
                      provider_id, password_hash, created_at, updated_at
            "#,
            email,
            name,
            avatar,
            provider as AuthProvider,
            provider_id
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            if let Some(db_err) = e.as_database_error() {
                if db_err.is_unique_violation() {
                    return ApiError::BadRequest("User with this email or provider ID already exists".to_string());
                }
            }
            tracing::error!("Database error creating OAuth user: {:?}", e);
            ApiError::Internal
        })
    }
}
