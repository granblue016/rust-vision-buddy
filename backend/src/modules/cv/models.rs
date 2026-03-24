use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// --- 1. REQUEST/RESPONSE STRUCTS ---

#[derive(Debug, Deserialize)]
pub struct CreateCvRequest {
    pub name: String,
    pub template_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CvResponse {
    pub id: Uuid,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCvRequest {
    pub name: Option<String>,
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
    pub avatar: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CvTheme {
    pub font_family: String,
    pub font_size: String,
    pub line_height: f32,
    pub primary_color: String,
    pub template_id: String,
}

impl Default for CvTheme {
    fn default() -> Self {
        Self {
            font_family: "Inter".to_string(),
            font_size: "14px".to_string(),
            line_height: 1.5,
            primary_color: "#4f46e5".to_string(),
            template_id: "modern-01".to_string(),
        }
    }
}

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

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CvSection {
    pub id: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub title: String,
    pub visible: bool,
    pub content: Option<String>,
    #[serde(default)]
    pub items: Vec<CvSectionItem>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct CvLayoutState {
    #[serde(default)]
    pub full_width: Vec<String>,
    #[serde(default)]
    pub left_column: Vec<String>,
    #[serde(default)]
    pub right_column: Vec<String>,
    #[serde(default)]
    pub unused: Vec<String>,
}

// CHÚ Ý: Đã xóa Default khỏi derive để triển khai thủ công bên dưới
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CvLayoutData {
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

/// Khởi tạo dữ liệu mẫu (Seed Data) cho CV mới để tránh lỗi màn hình trắng
impl Default for CvLayoutData {
    fn default() -> Self {
        Self {
            template_id: "modern-01".to_string(),
            personal_info: PersonalInfo {
                full_name: "NGUYỄN VĂN A".to_string(),
                title: "FULLSTACK DEVELOPER".to_string(),
                email: "hello@gmail.com".to_string(),
                phone: "0123 456 789".to_string(),
                address: "Quận 1, TP. Hồ Chí Minh".to_string(),
                website: "github.com/nguyenvana".to_string(),
                ..Default::default()
            },
            theme: CvTheme::default(),
            sections: vec![
                CvSection {
                    id: "section-header".to_string(),
                    r#type: "header".to_string(),
                    title: "Thông tin cá nhân".to_string(),
                    visible: true,
                    ..Default::default()
                },
                CvSection {
                    id: "section-skills".to_string(),
                    r#type: "skills".to_string(),
                    title: "Kỹ năng".to_string(),
                    visible: true,
                    items: vec![
                        CvSectionItem {
                            id: Uuid::new_v4().to_string(),
                            title: "React".to_string(),
                            ..Default::default()
                        },
                        CvSectionItem {
                            id: Uuid::new_v4().to_string(),
                            title: "Rust".to_string(),
                            ..Default::default()
                        },
                        CvSectionItem {
                            id: Uuid::new_v4().to_string(),
                            title: "Python".to_string(),
                            ..Default::default()
                        },
                    ],
                    ..Default::default()
                },
                CvSection {
                    id: "section-summary".to_string(),
                    r#type: "summary".to_string(),
                    title: "Giới thiệu bản thân".to_string(),
                    visible: true,
                    content: Some("Tôi là một lập trình viên đam mê học hỏi...".to_string()),
                    ..Default::default()
                },
                CvSection {
                    id: "section-experience".to_string(),
                    r#type: "experience".to_string(),
                    title: "Kinh nghiệm làm việc".to_string(),
                    visible: true,
                    items: vec![CvSectionItem {
                        id: Uuid::new_v4().to_string(),
                        title: "SENIOR DEVELOPER".to_string(),
                        subtitle: Some("Công ty ABC".to_string()),
                        date: Some("2022 - Hiện tại".to_string()),
                        description: Some(
                            "Phát triển hệ thống microservices bằng Rust.".to_string(),
                        ),
                    }],
                    ..Default::default()
                },
                CvSection {
                    id: "section-education".to_string(),
                    r#type: "education".to_string(),
                    title: "Học vấn".to_string(),
                    visible: true,
                    items: vec![CvSectionItem {
                        id: Uuid::new_v4().to_string(),
                        title: "KỸ THUẬT PHẦN MỀM".to_string(),
                        subtitle: Some("Đại học Sài Gòn".to_string()),
                        date: Some("2018 - 2022".to_string()),
                        description: Some("Mô tả công việc chi tiết...".to_string()),
                    }],
                    ..Default::default()
                },
            ],
            layout: CvLayoutState {
                full_width: vec!["section-header".to_string()],
                left_column: vec!["section-skills".to_string()],
                right_column: vec![
                    "section-summary".to_string(),
                    "section-experience".to_string(),
                    "section-education".to_string(),
                ],
                unused: vec![],
            },
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

fn default_id() -> String {
    Uuid::new_v4().to_string()
}
