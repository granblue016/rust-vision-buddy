-- Reset bảng cũ
DROP TABLE IF EXISTS cvs;

-- Đảm bảo có extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo lại bảng cvs
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Tạm thời để NOT NULL, bỏ REFERENCES users(id) nếu bạn chưa có bảng users chuẩn
    name VARCHAR(255) NOT NULL DEFAULT 'CV mẫu của tôi',

    layout_data JSONB NOT NULL DEFAULT '{
        "template_id": "modern-01",
        "theme": {
            "font_family": "Inter",
            "font_size": "14px",
            "line_height": 1.5,
            "primary_color": "#2563eb"
        },
        "sections": [
            {
                "id": "header",
                "type": "header",
                "title": "Thông tin cá nhân",
                "visible": true,
                "items": []
            },
            {
                "id": "experience",
                "type": "experience",
                "title": "Kinh nghiệm làm việc",
                "visible": true,
                "items": []
            }
        ]
    }',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CHÈN DỮ LIỆU MẪU (Dùng ID này để test thay vì số 1)
-- ID cố định: 550e8400-e29b-41d4-a716-446655440000
INSERT INTO cvs (id, user_id, name, layout_data)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '00000000-0000-0000-0000-000000000000',
    'CV Test Hệ Thống',
    '{
        "template_id": "modern-01",
        "sections": [
            {
                "id": "section-edu",
                "type": "education",
                "title": "Học vấn",
                "visible": true,
                "items": [
                    {
                        "id": "item-edu-1",
                        "title": "Kỹ thuật phần mềm",
                        "subtitle": "Đại học Sài Gòn",
                        "date": "2018 - 2022"
                    }
                ]
            }
        ]
    }'
);
