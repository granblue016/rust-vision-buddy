use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// 1. Từng mục nhỏ trong một Section (Ví dụ: 1 công ty, 1 trường học)
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvSectionItem {
    pub id: String,
    pub title: String,            // Ví dụ: Senior Developer
    pub subtitle: Option<String>, // Ví dụ: Công ty ABC
    pub date: Option<String>,     // Ví dụ: 2020 - 2024
    pub description: Option<String>,
}

/// 2. Cấu trúc của một Section (Kinh nghiệm, Học vấn...)
/// Đây là đơn vị sẽ được kéo thả trên giao diện
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CvSection {
    pub id: String,
    pub r#type: String, // "header", "experience", "education", "skills", "summary"
    pub title: String,  // Tiêu đề hiển thị (có thể sửa đổi)
    pub visible: bool,  // Trạng thái ẩn/hiện
    pub items: Vec<CvSectionItem>,
}

// Cung cấp giá trị mặc định cho Section nếu cần khởi tạo nhanh
impl Default for CvSection {
    fn default() -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            r#type: "experience".to_string(),
            title: "New Section".to_string(),
            visible: true,
            items: vec![],
        }
    }
}

/// 3. Định nghĩa các tùy chỉnh về giao diện (Theme)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CvTheme {
    pub font_family: String,
    pub font_size: String,
    pub line_height: f32,
    pub primary_color: String,
    pub secondary_color: Option<String>,
    pub background_image: Option<String>,
}

impl Default for CvTheme {
    fn default() -> Self {
        Self {
            font_family: "Inter".to_string(),
            font_size: "14px".to_string(),
            line_height: 1.5,
            primary_color: "#2563eb".to_string(),
            secondary_color: None,
            background_image: None,
        }
    }
}

/// 4. Chứa toàn bộ dữ liệu cấu trúc của CV (LayoutData)
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvLayoutData {
    pub template_id: String, // Ví dụ: "modern-01", "classic-v2"
    pub theme: CvTheme,
    pub sections: Vec<CvSection>, // Thứ tự mảng là thứ tự hiển thị thực tế
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

// --- Các Struct phục vụ Request/Response API ---

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
