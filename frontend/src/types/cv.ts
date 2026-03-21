// Khớp hoàn toàn với CvTheme trong Rust models.rs
export interface CvTheme {
  font_family: string;
  font_size: string;
  line_height: number;
  primary_color: string;
}

// Khớp với CvLayoutData (Cấu hình cho bộ kéo thả)
export interface CvLayoutData {
  theme: CvTheme;
  sections: Record<string, unknown>[];
}

// Model CV chính nhận về từ Backend
export interface Cv {
  id: string; // UUID dạng string
  user_id: string;
  name: string;
  layout_data: CvLayoutData;
  created_at: string;
  updated_at: string;
}

// Dữ liệu khi gửi lên để tạo mới
export interface CreateCvRequest {
  name: string;
}

// Dữ liệu khi gửi lên để cập nhật nội dung
export interface UpdateCvRequest {
  name?: string;
  layout_data: CvLayoutData;
}
