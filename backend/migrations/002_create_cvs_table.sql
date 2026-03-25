-- 1. Khởi tạo môi trường
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng CVS
CREATE TABLE IF NOT EXISTS cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Thêm REFERENCES users(id) nếu đã có bảng users
    name VARCHAR(255) NOT NULL DEFAULT 'CV chưa đặt tên',
    layout_data JSONB NOT NULL DEFAULT '{
        "template_id": "modern-01",
        "personalInfo": {"fullName": "HỌ TÊN", "title": "VỊ TRÍ", "email": "", "phone": "", "address": "", "website": ""},
        "theme": {"primary_color": "#4f46e5", "font_family": "Inter"},
        "layout": {"fullWidth": ["section-header"], "leftColumn": [], "rightColumn": []},
        "sections": []
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Chèn dữ liệu mẫu (Khớp với ID trên trình duyệt của bạn)
INSERT INTO cvs (id, user_id, name, layout_data)
VALUES (
    'ad1f7480-38b8-421b-bf3b-a0db13b9fa9e',
    '00000000-0000-0000-0000-000000000000', -- Đảm bảo ID này tồn tại bên bảng users nếu có ràng buộc
    'CV Mẫu Hệ Thống 2.0',
    '{
        "template_id": "modern-01",
        "personalInfo": {
            "fullName": "NGUYỄN VĂN ABCDEFFFG",
            "title": "FULLSTACK DEVELOPERRRRR",
            "email": "hello@gmail.com",
            "phone": "0123 456 789",
            "address": "TP. Hồ Chí Minh",
            "website": "github.com/nguyenvana"
        },
        "theme": { "primary_color": "#4f46e5", "font_family": "Inter" },
        "layout": {
            "fullWidth": ["section-header"],
            "leftColumn": ["section-skills"],
            "rightColumn": ["section-summary", "section-exp", "section-edu"]
        },
        "sections": [
            { "id": "section-header", "type": "header", "title": "Thông tin cá nhân", "visible": true },
            {
                "id": "section-skills",
                "type": "skills",
                "title": "Kỹ năng",
                "visible": true,
                "items": [
                    { "id": "sk-1", "title": "React" },
                    { "id": "sk-2", "title": "Rust" },
                    { "id": "sk-3", "title": "Python" }
                ]
            }
        ]
    }'
) ON CONFLICT (id) DO NOTHING;
