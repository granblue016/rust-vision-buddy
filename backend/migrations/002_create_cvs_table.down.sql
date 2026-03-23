-- 1. Xóa bảng cũ để làm sạch dữ liệu
DROP TABLE IF EXISTS cvs;

-- 2. Đảm bảo extension UUID đã sẵn sàng
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Tạo lại bảng với cấu trúc JSONB
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'CV mẫu của tôi',
    layout_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Chèn dữ liệu mẫu mới (Đã sửa thành Đại học Sài Gòn)
INSERT INTO cvs (id, user_id, name, layout_data)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '00000000-0000-0000-0000-000000000000',
    'CV Test Hệ Thống',
    '{
        "template_id": "modern-01",
        "theme": {
            "primary_color": "#2563eb"
        },
        "layout": {
            "fullWidth": ["section-header"],
            "leftColumn": ["section-skills"],
            "rightColumn": ["section-edu"],
            "unused": []
        },
        "sections": [
            {
                "id": "section-header",
                "type": "header",
                "title": "Thông tin cá nhân",
                "visible": true,
                "items": [
                    {
                        "title": "NGUYỄN VĂN A",
                        "subtitle": "Fullstack Developer"
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
