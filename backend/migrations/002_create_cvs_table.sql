-- Migration: Create CVS table
-- Description: Stores CV metadata and flexible JSON layout data

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'CV chưa đặt tên',

    -- JSONB lưu trữ Font, Màu sắc và Thứ tự các Section (Kéo thả)
    layout_data JSONB NOT NULL DEFAULT '{
        "theme": {
            "fontFamily": "Times New Roman",
            "fontSize": "md",
            "primaryColor": "#000000",
            "lineHeight": 1.5
        },
        "sections": []
    }',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_updated_at ON cvs(updated_at);
