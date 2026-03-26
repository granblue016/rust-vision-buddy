-- 1. Làm sạch dữ liệu cũ
DROP TABLE IF EXISTS cvs;

-- 2. Khởi tạo extension cho UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Tạo bảng với cấu trúc JSONB chuẩn CamelCase (khớp với #[serde(rename_all = "camelCase")])
CREATE TABLE IF NOT EXISTS cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'CV chưa đặt tên',
    layout_data JSONB NOT NULL DEFAULT '{
        "templateId": "modern-01",
        "personalInfo": {
            "fullName": "HỌ TÊN",
            "title": "VỊ TRÍ",
            "email": "",
            "phone": "",
            "address": "",
            "website": "",
            "avatar": null
        },
        "theme": {
            "fontFamily": "Inter",
            "fontSize": "14px",
            "lineHeight": 1.5,
            "primaryColor": "#4f46e5",
            "templateId": "modern-01"
        },
        "layout": {
            "fullWidth": ["section-header"],
            "leftColumn": [],
            "rightColumn": [],
            "unused": []
        },
        "sections": []
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Chèn dữ liệu mẫu chuẩn hóa hoàn toàn theo Rust Structs
INSERT INTO cvs (id, user_id, name, layout_data)
VALUES (
    'ad1f7480-38b8-421b-bf3b-a0db13b9fa9e',
    '00000000-0000-0000-0000-000000000000',
    'CV Mẫu Hệ Thống 2.1',
    '{
        "templateId": "modern-01",
        "personalInfo": {
            "fullName": "NGUYỄN VĂN ABCDEFFFG",
            "title": "FULLSTACK DEVELOPERRRRR",
            "email": "hello@gmail.com",
            "phone": "0123 456 789",
            "address": "TP. Hồ Chí Minh",
            "website": "github.com/nguyenvana",
            "avatar": null
        },
        "theme": {
            "fontFamily": "Inter",
            "fontSize": "14px",
            "lineHeight": 1.5,
            "primaryColor": "#4f46e5",
            "templateId": "modern-01"
        },
        "layout": {
            "fullWidth": ["section-header"],
            "leftColumn": ["section-skills"],
            "rightColumn": ["section-summary", "section-exp", "section-edu"],
            "unused": []
        },
        "sections": [
            {
                "id": "section-header",
                "type": "header",
                "title": "Thông tin cá nhân",
                "visible": true,
                "items": []
            },
            {
                "id": "section-skills",
                "type": "skills",
                "title": "Kỹ năng",
                "visible": true,
                "items": [
                    { "id": "sk-1", "title": "React", "subtitle": "", "description": "", "date": "" },
                    { "id": "sk-2", "title": "Rust", "subtitle": "", "description": "", "date": "" },
                    { "id": "sk-3", "title": "Python", "subtitle": "", "description": "", "date": "" }
                ]
            },
            {
                "id": "section-summary",
                "type": "summary",
                "title": "Giới thiệu",
                "visible": true,
                "content": "Đây là nội dung tóm tắt chuyên môn của tôi.",
                "items": []
            },
            {
                "id": "section-exp",
                "type": "experience",
                "title": "Kinh nghiệm làm việc",
                "visible": true,
                "items": [
                    { "id": "exp-1", "title": "Công ty ABC", "subtitle": "Software Engineer", "description": "Lập trình Rust/React", "date": "2024 - Hiện tại" }
                ]
            },
            {
                "id": "section-edu",
                "type": "education",
                "title": "Học vấn",
                "visible": true,
                "items": [
                    { "id": "edu-1", "title": "Đại học Công nghệ", "subtitle": "Cử nhân CNTT", "description": "", "date": "2020 - 2024" }
                ]
            }
        ]
    }'
) ON CONFLICT (id) DO UPDATE SET layout_data = EXCLUDED.layout_data;
