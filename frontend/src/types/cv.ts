/**
 * Định nghĩa Theme của CV - Đồng bộ tuyệt đối với Struct CvTheme trong Rust
 */
export interface CvTheme {
  font_family: string;
  font_size: string;
  line_height: number; // Trong Rust là f32
  primary_color: string;
  secondary_color?: string; // Khớp với Option<String>
  background_image?: string; // Khớp với Option<String>
}

/**
 * Đổi tên từ CvSectionItem thành CvItem để khớp với các Component đã viết
 * Sửa lỗi: "Module has no exported member CvItem"
 */
export interface CvItem {
  id: string; // UUID string hoặc nanoid dùng cho dnd-kit
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;

  // Các trường mở rộng
  link?: string;
  icon?: string;
  email?: string;
  phone?: string;
  location?: string;
}

/**
 * Các loại Section được hỗ trợ
 * Đã thêm "projects" và "summary" để khớp với logic Sidebar
 */
export type CvSectionType =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "custom";

/**
 * Cấu trúc của một Section lớn - Đơn vị dùng để kéo thả (SortableContext)
 */
export interface CvSection {
  id: string; // ID dùng cho SortableContext của dnd-kit
  type: CvSectionType;
  title: string;
  visible: boolean;
  items: CvItem[];
}

/**
 * Dữ liệu layout chính (Lưu dạng JSONB trong Postgres thông qua Rust)
 */
export interface CvLayoutData {
  template_id: string;
  theme: CvTheme;
  sections: CvSection[];
}

/**
 * Interface đầy đủ của đối tượng CV nhận về từ API
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

// --- Dữ liệu mặc định (Default/Mock Data) ---
// Giúp tránh lỗi "màn hình trắng" khi dữ liệu từ Backend chưa tải kịp

export const DEFAULT_CV_DATA: CvLayoutData = {
  template_id: "modern-01",
  theme: {
    font_family: "Inter",
    font_size: "14px",
    line_height: 1.5,
    primary_color: "#2563eb",
  },
  sections: [
    {
      id: "section-header",
      type: "header",
      title: "Thông tin cá nhân",
      visible: true,
      items: [
        {
          id: "item-header-1",
          title: "NGUYỄN VĂN A",
          subtitle: "Fullstack Developer",
          email: "contact@example.com",
          phone: "0901.234.567",
        },
      ],
    },
    {
      id: "section-exp",
      type: "experience",
      title: "Kinh nghiệm làm việc",
      visible: true,
      items: [
        {
          id: "item-exp-1",
          title: "Senior Developer",
          subtitle: "Công ty Công nghệ ABC",
          date: "2022 - Hiện tại",
          description:
            "Phát triển hệ thống microservices sử dụng Rust và React.",
        },
      ],
    },
    {
      id: "section-edu",
      type: "education",
      title: "Học vấn",
      visible: true,
      items: [
        {
          id: "item-edu-1",
          title: "Kỹ thuật phần mềm",
          subtitle: "Đại học Bách Khoa",
          date: "2018 - 2022",
        },
      ],
    },
  ],
};
