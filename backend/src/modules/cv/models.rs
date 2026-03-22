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
    pub r#type: String, // "experience", "education", "skills", v.v.
    pub title: String,  // Tiêu đề hiển thị (có thể sửa đổi)
    pub visible: bool,  // Trạng thái ẩn/hiện của section này
    pub items: Vec<CvSectionItem>,
}

/// 3. Định nghĩa các tùy chỉnh về giao diện
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CvTheme {
    pub font_family: String,
    pub font_size: String,
    pub line_height: f32,
    pub primary_color: String,
    pub secondary_color: Option<String>,
    pub background_image: Option<String>,
}

// Cung cấp giá trị mặc định cho Theme
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

/// 4. Chứa toàn bộ dữ liệu cấu trúc của CV
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvLayoutData {
    pub template_id: String, // ID của biểu mẫu (ví dụ: "modern-01", "classic-v2")
    pub theme: CvTheme,
    pub sections: Vec<CvSection>, // Thứ tự trong mảng này chính là thứ tự hiển thị
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

// Các struct cho Request/Response
#[derive(Debug, Serialize)]
pub struct CvResponse {
    pub id: Uuid,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCvRequest {
    pub name: String,
    pub template_id: Option<String>, // Cho phép chọn mẫu khi tạo mới
}

#[derive(Debug, Deserialize)]
pub struct UpdateCvRequest {
    pub name: Option<String>,
    pub layout_data: CvLayoutData,
}
