use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::fmt;

// --- Enums ---

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq, Eq)]
#[sqlx(type_name = "auth_provider", rename_all = "lowercase")]
pub enum AuthProvider {
    #[serde(rename = "email")]
    Email,
    #[serde(rename = "google")]
    Google,
    #[serde(rename = "github")]
    GitHub,
}

// Giúp hiển thị enum dưới dạng string khi cần (log, mapping)
impl fmt::Display for AuthProvider {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AuthProvider::Email => write!(f, "email"),
            AuthProvider::Google => write!(f, "google"),
            AuthProvider::GitHub => write!(f, "github"),
        }
    }
}

// --- Entities ---

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
    // Lưu ý: sqlx::Type yêu cầu mapping chính xác với custom type trong Postgres
    pub provider: AuthProvider,
    pub provider_id: Option<String>,
    #[serde(skip_serializing)] // Không bao giờ gửi hash password về client
    pub password_hash: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// --- Request Payloads ---

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
}

/// Query parameters nhận về từ redirect của Google/GitHub
#[derive(Debug, Deserialize)]
pub struct OAuthCallbackRequest {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
    pub error_description: Option<String>,
}

// --- Response Payloads ---

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub token_type: &'static str,
    pub expires_in_minutes: i64,
}

#[derive(Debug, Serialize)]
pub struct LogoutResponse {
    pub message: &'static str,
}

#[derive(Debug, Serialize)]
pub struct RegisterResponse {
    pub message: &'static str,
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct OAuthInitResponse {
    pub authorization_url: String,
}

// --- Security & Internal ---

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // Email hoặc User ID
    pub exp: i64,    // Timestamp hết hạn (giây)
    pub iat: i64,    // Timestamp thời điểm tạo (giây)
}

/// Cấu trúc trung gian để chuẩn hóa dữ liệu từ các OAuth provider khác nhau
#[derive(Debug, Clone)]
pub struct RawOAuthUser {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub picture: Option<String>,
}
