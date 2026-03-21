use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvTheme {
    pub font_family: String,
    pub font_size: String,
    pub line_height: f32,
    pub primary_color: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvLayoutData {
    pub theme: CvTheme,
    pub sections: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Cv {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    // Sử dụng sqlx::types::Json để tự động handle việc Serialize/Deserialize JSONB
    pub layout_data: sqlx::types::Json<CvLayoutData>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct CvResponse {
    pub id: Uuid,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCvRequest {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCvRequest {
    pub name: Option<String>,
    pub layout_data: CvLayoutData,
}
