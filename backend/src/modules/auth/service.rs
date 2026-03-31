use crate::{
    shared::api_error::ApiError,
    shared::app_state::AppState,
    modules::auth::{jwt, models::{User, AuthProvider}},
};
use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};
use async_trait::async_trait;
use uuid::Uuid;

#[cfg(test)]
use mockall::automock;

// --- 1. REPOSITORY TRAIT ---
#[async_trait]
#[cfg_attr(test, automock)]
pub trait AuthRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, ApiError>;
    async fn find_by_provider(&self, provider: AuthProvider, provider_id: &str) -> Result<Option<User>, ApiError>;
    async fn update_password_hash(&self, user_id: Uuid, new_hash: &str) -> Result<(), ApiError>;
    async fn create_email_user(&self, email: &str, hash: &str) -> Result<User, ApiError>;
    async fn create_oauth_user(
        &self,
        email: &str,
        name: Option<&str>,
        avatar: Option<&str>,
        provider: AuthProvider,
        provider_id: &str
    ) -> Result<User, ApiError>;
}

// --- 2. PASSWORD HELPERS ---
fn hash_password(password: &str) -> Result<String, ApiError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| {
            tracing::error!("Hash password error: {:?}", e);
            ApiError::Internal
        })
}

fn verify_password(stored_password: &str, provided_password: &str) -> Result<bool, ApiError> {
    if stored_password.starts_with("$argon2") {
        let parsed_hash = PasswordHash::new(stored_password).map_err(|_| ApiError::Internal)?;
        return Ok(Argon2::default()
            .verify_password(provided_password.as_bytes(), &parsed_hash)
            .is_ok());
    }
    // Hỗ trợ so sánh plaintext nếu chưa nâng cấp lên Argon2
    Ok(stored_password == provided_password)
}

// --- 3. SERVICE LOGIC ---

pub async fn validate_credentials<R: AuthRepository + ?Sized>(
    email: &str,
    password: &str,
    repo: &R
) -> Result<User, ApiError> {
    let user = repo.find_by_email(email).await?
        .ok_or(ApiError::Unauthorized)?;

    let stored_password = user.password_hash.as_deref().ok_or(ApiError::Unauthorized)?;

    if verify_password(stored_password, password)? {
        // Nâng cấp hash nếu user vẫn dùng plaintext (Argon2 migration)
        if !stored_password.starts_with("$argon2") {
            if let Ok(upgraded_hash) = hash_password(password) {
                let _ = repo.update_password_hash(user.id, &upgraded_hash).await;
            }
        }
        return Ok(user);
    }

    Err(ApiError::Unauthorized)
}

pub async fn register<R: AuthRepository + ?Sized>(
    email: &str,
    password: &str,
    repo: &R
) -> Result<User, ApiError> {
    let normalized_email = email.trim().to_lowercase();

    if normalized_email.len() < 5 || !normalized_email.contains('@') {
        return Err(ApiError::BadRequest("Invalid email format".into()));
    }

    if password.len() < 6 {
        return Err(ApiError::BadRequest("Password must be at least 6 characters".into()));
    }

    let password_hash = hash_password(password)?;
    repo.create_email_user(&normalized_email, &password_hash).await
}

pub async fn find_or_create_oauth_user<R: AuthRepository + ?Sized>(
    email: &str,
    name: Option<&str>,
    avatar_url: Option<&str>,
    provider_id: &str,
    provider: AuthProvider,
    repo: &R,
) -> Result<User, ApiError> {
    // 1. Tìm chính xác theo provider + id
    if let Some(user) = repo.find_by_provider(provider.clone(), provider_id).await? {
        return Ok(user);
    }

    // 2. Account linking: Tìm theo email (nếu email đã tồn tại thì liên kết luôn)
    if let Some(user) = repo.find_by_email(email).await? {
        return Ok(user);
    }

    // 3. Không có thì tạo mới
    repo.create_oauth_user(email, name, avatar_url, provider, provider_id).await
}

pub fn login(email: &str, state: &AppState) -> Result<String, ApiError> {
    jwt::generate_access_token(email, state)
}

pub fn validate_bearer_token(raw_token: &str, state: &AppState) -> Result<String, ApiError> {
    // FIX: jwt::validate_token trả về Result<Claims>, ta cần lấy field .sub (email)
    let claims = jwt::validate_token(raw_token, state)?;
    Ok(claims.sub)
}

// --- 4. UNIT TESTS ---
#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn mock_user(email: &str) -> User {
        User {
            id: Uuid::new_v4(),
            email: email.to_string(),
            name: None,
            avatar_url: None,
            provider: AuthProvider::Email,
            provider_id: None,
            password_hash: Some("$argon2...".to_string()),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[tokio::test]
    async fn test_register_email_already_exists() {
        let mut mock_repo = MockAuthRepository::new();

        mock_repo.expect_create_email_user()
            .returning(|_email, _pass| {
                Box::pin(async move {
                    Err(ApiError::BadRequest("Email already exists".to_string()))
                })
            });

        let result = register("existing@test.com", "password123", &mock_repo).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_validate_credentials_success() {
        let mut mock_repo = MockAuthRepository::new();
        let email = "test@example.com";
        let password = "password123";
        let hash = hash_password(password).unwrap();

        let mut user = mock_user(email);
        user.password_hash = Some(hash);

        mock_repo.expect_find_by_email()
            .returning(move |_| {
                let u = user.clone();
                Box::pin(async move { Ok(Some(u)) })
            });

        let result = validate_credentials(email, password, &mock_repo).await;
        assert!(result.is_ok());
    }
}
