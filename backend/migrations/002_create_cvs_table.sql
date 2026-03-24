-- 1. Xóa để làm sạch mặt bằng
DROP TABLE IF EXISTS cvs;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng với cấu trúc JSONB linh hoạt nhưng có giá trị mặc định đầy đủ
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'CV chưa đặt tên',
    -- layout_data chứa toàn bộ thông tin nội dung, theme và vị trí các section
    layout_data JSONB NOT NULL DEFAULT '{
        "template_id": "modern-01",
        "personalInfo": {
            "fullName": "HỌ TÊN CỦA BẠN",
            "title": "VỊ TRÍ ỨNG TUYỂN",
            "email": "",
            "phone": "",
            "address": "",
            "website": ""
        },
        "theme": {
            "template_id": "modern-01",
            "font_family": "Inter",
            "font_size": "14px",
            "line_height": 1.5,
            "primary_color": "#4f46e5"
        },
        "layout": {
            "fullWidth": ["section-header"],
            "leftColumn": [],
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
            }
        ]
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Chèn CV mẫu hoàn chỉnh để test hệ thống ngay lập tức
INSERT INTO cvs (id, user_id, name, layout_data)
VALUES (
    'ad1f7480-38b8-421b-bf3b-a0db13b9fa9e', -- UUID khớp với ảnh demo của bạn
    '00000000-0000-0000-0000-000000000000',
    'CV Mẫu Hệ Thống 2.0',
    '{
        "template_id": "modern-01",
        "personalInfo": {
            "fullName": "NGUYỄN VĂN A",
            "title": "FULLSTACK DEVELOPER",
            "email": "hello@gmail.com",
            "phone": "0123 456 789",
            "address": "TP. Hồ Chí Minh",
            "website": "github.com/nguyenvana"
        },
        "theme": {
            "template_id": "modern-01",
            "font_family": "Inter",
            "font_size": "14px",
            "line_height": 1.5,
            "primary_color": "#4f46e5"
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
                "id": "section-summary",
                "type": "summary",
                "title": "Giới thiệu bản thân",
                "content": "Tôi là một lập trình viên đam mê học hỏi...",
                "visible": true,
                "items": []
            },
            {
                "id": "section-exp",
                "type": "experience",
                "title": "Kinh nghiệm làm việc",
                "visible": true,
                "items": [
                    {
                        "id": "exp-1",
                        "title": "Senior Developer",
                        "subtitle": "Công ty ABC",
                        "date": "2022 - Hiện tại",
                        "description": "Phát triển hệ thống microservices bằng Rust."
                    }
                ]
            },
            {
                "id": "section-edu",
                "type": "education",
                "title": "Học vấn",
                "visible": true,
                "items": [
                    {
                        "id": "edu-1",
                        "title": "Kỹ thuật phần mềm",
                        "subtitle": "Đại học Sài Gòn",
                        "date": "2018 - 2022"
                    }
                ]
            },
            {
                "id": "section-skills",
                "type": "skills",
                "title": "Kỹ năng",
                "visible": true,
                "items": [
                    { "id": "sk-1", "title": "React" },
                    { "id": "sk-2", "title": "Rust" }
                ]
            }
        ]
    }'
);
