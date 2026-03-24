/**
 * Định nghĩa Theme của CV - Đồng bộ tuyệt đối với Struct CvTheme trong Rust
 */
export interface CvTheme {
  font_family: string;
  font_size: string;
  line_height: number; // Tương ứng f32 trong Rust
  primary_color: string;
  template_id: string; // Đồng bộ với template đang sử dụng
  secondary_color?: string;
  background_image?: string;
}

/**
 * Đơn vị dữ liệu nhỏ nhất trong một Section
 */
export interface CvItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  /** Trường quan trọng: Chứa nội dung Rich Text (HTML) từ Editor */
  content?: string;
  description?: string; // Có thể dùng song song hoặc gộp vào content
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
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "awards"
  | "certs"
  | "activities"
  | "references"
  | "hobbies"
  | "custom";

/**
 * Định nghĩa các khu vực kéo thả (Dropzones)
 */
export type LayoutColumnId =
  | "fullWidth"
  | "leftColumn"
  | "rightColumn"
  | "unused";

/**
 * Cấu trúc của một Section lớn
 */
export interface CvSection {
  id: string;
  type: CvSectionType;
  title: string;
  visible: boolean;
  /** Cho phép gõ nội dung trực tiếp vào Section (ví dụ: phần Summary) */
  content?: string;
  items: CvItem[];
}

/**
 * Quản lý vị trí của các Section trong từng cột
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
 * Interface đầy đủ cho Zustand Store
 */
export interface CvStoreState {
  // --- State ---
  currentCvId: string | null;
  data: CvLayoutData;
  isSaving: boolean;
  isLoading: boolean;
  isDirty: boolean;
  error: string | null;
  lastSaved: Date | null;

  // --- Actions hệ thống ---
  setIsSaving: (isSaving: boolean) => void;
  setInitialData: (data: CvLayoutData) => void;
  fetchCv: (id: string) => Promise<void>;
  saveChanges: () => Promise<void>;
  triggerAutoSave: () => void;

  // --- Actions giao diện ---
  setTemplateId: (id: string) => void;
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  updateCvField: (field: string, value: any) => void;

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
  updateSectionTitle: (sectionId: string, title: string) => void;
  /** Cập nhật nội dung cho Section (Summary, v.v.) */
  updateSectionContent: (sectionId: string, content: string) => void;
  /** Cập nhật nội dung cho từng Item */
  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvItem,
    value: string,
  ) => void;

  // --- Actions thêm/xóa mục ---
  addItem: (sectionId: string) => void;
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
          content: "Phát triển hệ thống microservices sử dụng Rust và React.",
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
          content: "Tốt nghiệp loại Giỏi, chuyên ngành Công nghệ phần mềm.",
        },
      ],
    },
    {
      id: "section-skills",
      type: "skills",
      title: "Kỹ năng",
      visible: true,
      items: [
        { id: "skill-1", title: "React/TypeScript", content: "Thành thạo" },
        { id: "skill-2", title: "Rust/Axum", content: "Cơ bản" },
      ],
    },
    {
      id: "section-hobbies",
      type: "hobbies",
      title: "Sở thích",
      visible: true,
      items: [
        {
          id: "hobby-1",
          title: "Đọc sách",
          content: "Sách kỹ thuật & phát triển bản thân",
        },
      ],
    },
    {
      id: "section-summary",
      type: "summary",
      title: "Giới thiệu bản thân",
      visible: true,
      content: "Tôi là một lập trình viên đam mê công nghệ...",
      items: [],
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
          content: "Xây dựng bằng Rust (Axum) và React.",
        },
      ],
    },
  ],
};
