/**
 * Định nghĩa Theme của CV - Đồng bộ tuyệt đối với Struct CvTheme trong Rust
 */
export interface CvTheme {
  font_family: string;
  font_size: string;
  line_height: number; // Trong Rust là f32
  primary_color: string;
  template_id: string; // PHẢI CÓ: Để fix lỗi ở EditorToolbar.tsx
  secondary_color?: string; // Khớp với Option<String>
  background_image?: string; // Khớp với Option<String>
}

/**
 * Đơn vị dữ liệu nhỏ nhất trong một Section (Ví dụ: một công ty trong mục Kinh nghiệm)
 */
export interface CvItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  link?: string;
  icon?: string;
  email?: string;
  phone?: string;
  location?: string;
}

/**
 * Các loại Section được hỗ trợ - Mở rộng đầy đủ theo các mẫu của TopCV
 */
export type CvSectionType =
  | "header" // Thông tin cá nhân
  | "summary" // Giới thiệu bản thân
  | "experience" // Kinh nghiệm làm việc
  | "education" // Học vấn
  | "skills" // Kỹ năng
  | "projects" // Dự án
  | "awards" // Giải thưởng
  | "certs" // Chứng chỉ
  | "activities" // Hoạt động
  | "references" // Người tham chiếu
  | "hobbies" // Sở thích
  | "custom"; // Mục tùy chỉnh

/**
 * Định nghĩa các khu vực kéo thả (Dropzones) để phân chia bố cục
 */
export type LayoutColumnId =
  | "fullWidth" // Thường dùng cho Header
  | "leftColumn" // Cột nhỏ (Sidebar)
  | "rightColumn" // Cột lớn (Main Content)
  | "unused"; // Kho chứa các mục chưa dùng

/**
 * Cấu trúc của một Section lớn
 */
export interface CvSection {
  id: string;
  type: CvSectionType;
  title: string;
  visible: boolean;
  items: CvItem[];
}

/**
 * Quản lý vị trí (thứ tự sắp xếp) của các Section trong từng cột
 */
export interface CvLayoutState {
  fullWidth: string[];
  leftColumn: string[];
  rightColumn: string[];
  unused: string[];
}

/**
 * Dữ liệu layout chính (Lưu dạng JSONB trong Postgres thông qua Rust)
 */
export interface CvLayoutData {
  template_id: string;
  theme: CvTheme;
  sections: CvSection[];
  layout: CvLayoutState;
}

/**
 * Interface đối tượng CV nhận về từ API
 */
export interface Cv {
  id: string;
  user_id: string;
  name: string;
  layout_data: CvLayoutData;
  created_at: string;
  updated_at: string;
}

/**
 * --- API REQUEST INTERFACES ---
 */
export interface CreateCvRequest {
  name: string;
  template_id?: string;
}

export interface UpdateCvRequest {
  name?: string;
  layout_data: CvLayoutData;
}

/**
 * Interface đầy đủ cho Zustand Store - Quản lý logic kéo thả và chỉnh sửa
 */
export interface CvStoreState {
  // --- State ---
  currentCvId: string | null;
  data: CvLayoutData;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  lastSaved?: Date | null;

  // --- Actions hệ thống ---
  setIsSaving: (isSaving: boolean) => void;
  setInitialData: (data: CvLayoutData) => void;
  fetchCv: (id: string) => Promise<void>;
  saveChanges: () => Promise<void>;
  triggerAutoSave: () => void; // Thêm để sửa lỗi ts 2339 trong useCvStore

  // --- Actions giao diện ---
  setTemplateId: (id: string) => void;
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  updateCvField: (field: keyof CvLayoutData, value: any) => void;

  // --- Actions kéo thả (Core Dnd) ---
  reorderSections: (columnId: LayoutColumnId, newIds: string[]) => void;
  moveSection: (
    sectionId: string,
    sourceCol: LayoutColumnId,
    destCol: LayoutColumnId,
    index: number,
  ) => void;

  // --- Actions chỉnh sửa nội dung ---
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void; // Thêm mới
  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvItem,
    value: string,
  ) => void;

  // --- Actions thêm/xóa mục ---
  addItem: (sectionId: string, type: CvSectionType) => void;
  removeItem: (sectionId: string, itemId: string) => void;
}

// --- Dữ liệu mặc định (Default Data) ---
export const DEFAULT_CV_DATA: CvLayoutData = {
  template_id: "modern-01",
  theme: {
    template_id: "modern-01",
    font_family: "Inter",
    font_size: "14px",
    line_height: 1.5,
    primary_color: "#2563eb",
  },
  layout: {
    fullWidth: ["section-header"],
    leftColumn: ["section-skills", "section-hobbies"],
    rightColumn: ["section-exp", "section-edu", "section-projects"],
    unused: ["section-summary", "section-awards", "section-certs"],
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
          location: "Hà Nội, Việt Nam",
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
          subtitle: "Đại học Sài Gòn",
          date: "2018 - 2022",
        },
      ],
    },
    {
      id: "section-skills",
      type: "skills",
      title: "Kỹ năng",
      visible: true,
      items: [
        { id: "skill-1", title: "React/TypeScript" },
        { id: "skill-2", title: "Rust/Spring Boot" },
      ],
    },
    {
      id: "section-hobbies",
      type: "hobbies",
      title: "Sở thích",
      visible: true,
      items: [
        { id: "hobby-1", title: "Đọc sách công nghệ" },
        { id: "hobby-2", title: "Chạy bộ" },
      ],
    },
    {
      id: "section-summary",
      type: "summary",
      title: "Giới thiệu bản thân",
      visible: true,
      items: [{ id: "sum-1", title: "Tóm tắt chuyên môn..." }],
    },
    {
      id: "section-projects",
      type: "projects",
      title: "Dự án tiêu biểu",
      visible: true,
      items: [
        {
          id: "proj-1",
          title: "Hệ thống quản lý CV",
          description: "Project cá nhân sử dụng Rust",
        },
      ],
    },
  ],
};
