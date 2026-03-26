use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// --- 1. REQUEST/RESPONSE STRUCTS ---

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCvRequest {
    pub name: String,
    pub template_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CvResponse {
    pub id: Uuid,
    pub message: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCvRequest {
    pub name: Option<String>,
    // Frontend gửi "layoutData", Rust map vào layout_data
    pub layout_data: CvLayoutData,
}

// --- 2. CORE MODELS ---

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct PersonalInfo {
    #[serde(default)]
    pub full_name: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub phone: String,
    #[serde(default)]
    pub address: String,
    #[serde(default)]
    pub website: String,
    #[serde(default)]
    pub avatar: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CvTheme {
    #[serde(default = "default_font_family")]
    pub font_family: String,
    #[serde(default = "default_font_size")]
    pub font_size: String,
    // Lưu ý: Frontend CẦN gửi số, nhưng Backend để mặc định nếu lỗi
    #[serde(default = "default_line_height")]
    pub line_height: f32,
    #[serde(default = "default_primary_color")]
    pub primary_color: String,
    #[serde(default = "default_template_id")]
    pub template_id: String,
}

impl Default for CvTheme {
    fn default() -> Self {
        Self {
            font_family: default_font_family(),
            font_size: default_font_size(),
            line_height: default_line_height(),
            primary_color: default_primary_color(),
            template_id: default_template_id(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct CvSectionItem {
    #[serde(default = "default_uuid_str")]
    pub id: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub subtitle: Option<String>,
    #[serde(default)]
    pub date: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub phone: Option<String>,
    #[serde(default)]
    pub location: Option<String>,
    #[serde(default)]
    pub link: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct CvSection {
    #[serde(default = "default_uuid_str")]
    pub id: String,
    #[serde(default = "default_section_type")]
    #[serde(rename = "type")]
    pub r#type: String,
    #[serde(default)]
    pub title: String,
    #[serde(default = "default_visible")]
    pub visible: bool,
    #[serde(default)]
    pub content: Option<String>,
    #[serde(default)]
    pub items: Vec<CvSectionItem>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct CvLayoutState {
    // Dùng alias để "chấp hết" các loại tên cột từ Frontend gửi lên
    #[serde(default, alias = "column-1")]
    pub full_width: Vec<String>,
    #[serde(default, alias = "column-2")]
    pub left_column: Vec<String>,
    #[serde(default, alias = "column-3")]
    pub right_column: Vec<String>,
    #[serde(default)]
    pub unused: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CvLayoutData {
    #[serde(default = "default_template_id")]
    pub template_id: String,
    #[serde(default)]
    pub personal_info: PersonalInfo,
    #[serde(default)]
    pub theme: CvTheme,
    #[serde(default)]
    pub sections: Vec<CvSection>,
    #[serde(default)]
    pub layout: CvLayoutState,
}

impl Default for CvLayoutData {
    fn default() -> Self {
        Self {
            template_id: default_template_id(),
            personal_info: PersonalInfo::default(),
            theme: CvTheme::default(),
            sections: vec![],
            layout: CvLayoutState::default(),
        }
    }
}

// --- 3. DATABASE MODEL ---

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Cv {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub layout_data: sqlx::types::Json<CvLayoutData>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// --- 4. HELPER FUNCTIONS ---

fn default_font_family() -> String {
    "Inter".into()
}
fn default_font_size() -> String {
    "14px".into()
}
fn default_line_height() -> f32 {
    1.5
}
fn default_primary_color() -> String {
    "#4f46e5".into()
}
fn default_template_id() -> String {
    "modern-01".into()
}
fn default_visible() -> bool {
    true
}
fn default_section_type() -> String {
    "experience".into()
}
fn default_uuid_str() -> String {
    Uuid::new_v4().to_string()
}
