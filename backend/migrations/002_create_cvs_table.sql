-- 1. Xóa để làm sạch mặt bằng
DROP TABLE IF EXISTS cvs;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng với cấu trúc giữ nguyên nhưng ràng buộc chặt chẽ hơn
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'CV chưa đặt tên',
    -- Đảm bảo layout_data luôn có cấu trúc tối thiểu
    layout_data JSONB NOT NULL DEFAULT '{
        "template_id": "modern-01",
        "theme": {
            "font_family": "Inter",
            "font_size": "14px",
            "line_height": 1.5,
            "primary_color": "#2563eb"
        },
        "sections": []
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Chèn CV mẫu với "Hợp đồng dữ liệu" đầy đủ cho Inline Editing
INSERT INTO cvs (id, user_id, name, layout_data)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '00000000-0000-0000-0000-000000000000',
    'CV Test Hệ Thống 2.0',
    '{
        "template_id": "modern-01",
        "theme": {
            "font_family": "Inter",
            "font_size": "14px",
            "line_height": 1.5,
            "primary_color": "#2563eb"
        },
        "sections": [
            {
                "id": "section-header",
                "type": "header",
                "title": "Thông tin cá nhân",
                "content": "Họ và tên của bạn",
                "visible": true,
                "items": []
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
                        "date": "2018 - 2022",
                        "content": "Mô tả quá trình học tập tại đây..."
                    }
                ]
            }
        ]
    }'
);
