use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// 1. Từng mục nhỏ trong một Section
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvSectionItem {
    #[serde(default = "default_id")]
    pub id: String,

    #[serde(default)]
    pub title: String,

    pub subtitle: Option<String>,
    pub date: Option<String>,
    pub description: Option<String>,
}

/// 2. Cấu trúc của một Section (Kinh nghiệm, Học vấn...)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CvSection {
    #[serde(default = "default_id")]
    pub id: String,

    #[serde(default = "default_type")]
    pub r#type: String,

    #[serde(default = "default_section_title")]
    pub title: String,

    #[serde(default = "default_true")]
    pub visible: bool,

    #[serde(default)]
    pub items: Vec<CvSectionItem>,
}

/// 3. Định nghĩa các tùy chỉnh về giao diện (Theme)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CvTheme {
    #[serde(default = "default_font_family")]
    pub font_family: String,

    #[serde(default = "default_font_size")]
    pub font_size: String,

    #[serde(default = "default_line_height")]
    pub line_height: f32,

    #[serde(default = "default_primary_color")]
    pub primary_color: String,

    pub secondary_color: Option<String>,
    pub background_image: Option<String>,
}

/// 4. Chứa toàn bộ dữ liệu cấu trúc của CV (LayoutData)
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvLayoutData {
    #[serde(default = "default_template")]
    pub template_id: String,

    #[serde(default)]
    pub theme: CvTheme,

    #[serde(default)]
    pub sections: Vec<CvSection>,

    // Thêm trường layout để khớp với Frontend
    #[serde(default)]
    pub layout: std::collections::HashMap<String, Vec<String>>,
}

/// 5. Model đại diện cho bảng 'cvs' trong Postgres
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Cv {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub layout_data: sqlx::types::Json<CvLayoutData>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// --- CÁC HÀM BỔ TRỢ GIÁ TRỊ MẶC ĐỊNH (FIX LỖI MISSING FIELD) ---

fn default_id() -> String {
    Uuid::new_v4().to_string()
}

fn default_type() -> String {
    "experience".to_string()
}

fn default_section_title() -> String {
    "New Section".to_string()
}

fn default_template() -> String {
    "modern-01".to_string()
}

fn default_true() -> bool {
    true
}

fn default_font_family() -> String {
    "Inter".to_string()
}

fn default_font_size() -> String {
    "14px".to_string()
}

fn default_line_height() -> f32 {
    1.5
}

fn default_primary_color() -> String {
    "#2563eb".to_string()
}

// --- IMPLEMENT DEFAULT ---

impl Default for CvSection {
    fn default() -> Self {
        Self {
            id: default_id(),
            r#type: default_type(),
            title: default_section_title(),
            visible: true,
            items: vec![],
        }
    }
}

impl Default for CvTheme {
    fn default() -> Self {
        Self {
            font_family: default_font_family(),
            font_size: default_font_size(),
            line_height: default_line_height(),
            primary_color: default_primary_color(),
            secondary_color: None,
            background_image: None,
        }
    }
}

// --- Cấu trúc Request/Response ---

#[derive(Debug, Serialize)]
pub struct CvResponse {
    pub id: Uuid,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCvRequest {
    pub name: String,
    pub template_id: Option<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct UpdateCvRequest {
    pub name: Option<String>,
    pub layout_data: CvLayoutData,
}
