/**
 * Định nghĩa Theme của CV - Đồng bộ với Struct Rust
 */
export interface CvTheme {
  font_family: string;
  font_size: string;
  line_height: number;
  primary_color: string;
  secondary_color?: string; // Khớp với Option<String> trong Rust
  background_image?: string; // Khớp với Option<String> trong Rust
}

/**
 * Định nghĩa từng mục nhỏ trong một Section
 */
export interface CvSectionItem {
  id: string; // UUID (Frontend dùng crypto.randomUUID())
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;

  // Trường dành riêng cho Header/Personal Info
  link?: string;
  icon?: string;
  email?: string;
  phone?: string;
  location?: string;
}

/**
 * Các loại Section được hỗ trợ
 */
export type CvSectionType =
  | "experience"
  | "education"
  | "skills"
  | "custom"
  | "personal_info"
  | "summary"
  | "header";

/**
 * Cấu trúc của một Section lớn
 */
export interface CvSection {
  id: string; // Định danh cho dnd-kit (kéo thả)
  type: CvSectionType;
  title: string;
  visible: boolean;
  items: CvSectionItem[];
}

/**
 * Dữ liệu layout chính của CV (Lưu dạng JSONB trong Postgres)
 */
export interface CvLayoutData {
  template_id: string; // "modern", "classic", "creative"
  theme: CvTheme;
  sections: CvSection[];
}

/**
 * Interface đầy đủ của đối tượng CV từ Rust Backend
 */
export interface Cv {
  id: string;
  user_id: string;
  name: string;
  layout_data: CvLayoutData;
  created_at: string;
  updated_at: string;
}

// --- API Request Interfaces ---

export interface CreateCvRequest {
  name: string;
  template_id?: string;
}

export interface UpdateCvRequest {
  name?: string;
  layout_data: CvLayoutData;
}

// --- Default Data (Dùng để khởi tạo CV mới) ---

export const DEFAULT_CV_DATA: CvLayoutData = {
  template_id: "modern",
  theme: {
    font_family: "Inter",
    font_size: "14px",
    line_height: 1.5,
    primary_color: "#2563eb",
  },
  sections: [
    {
      id: "header-1",
      type: "header",
      title: "Thông tin cá nhân",
      visible: true,
      items: [
        {
          id: "item-1",
          title: "Họ và Tên của bạn",
          subtitle: "Vị trí ứng tuyển",
          email: "email@example.com",
          phone: "0123456789",
        },
      ],
    },
  ],
};
