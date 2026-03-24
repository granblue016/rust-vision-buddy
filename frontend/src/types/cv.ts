/**
 * Thông tin cá nhân tập trung (Header) - Giống cấu trúc TopCV
 */
export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  avatar?: string;
}

/**
 * Định nghĩa Theme của CV - Đồng bộ tuyệt đối với Struct CvTheme trong Rust
 */
export interface CvTheme {
  font_family: string;
  font_size: string;
  line_height: number;
  primary_color: string;
  template_id: string;
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
  content?: string;
  description?: string;
  link?: string;
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
  | "custom";

/**
 * Định nghĩa các khu vực kéo thả (Dropzones)
 */
export type LayoutColumnId =
  | "fullWidth"
  | "leftColumn"
  | "rightColumn"
  | "unused";

export interface CvSection {
  id: string;
  type: CvSectionType;
  title: string;
  visible: boolean;
  content?: string;
  items: CvItem[];
}

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
  personalInfo: PersonalInfo;
  theme: CvTheme;
  sections: CvSection[];
  layout: CvLayoutState;
}

/**
 * Interface đại diện cho một CV hoàn chỉnh từ Database
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
 * Interface đầy đủ cho Zustand Store quản lý trạng thái CV
 */
export interface CvStoreState {
  currentCvId: string | null;
  data: CvLayoutData;
  isSaving: boolean;
  isLoading: boolean;
  isDirty: boolean;
  error: string | null;
  lastSaved: Date | null;

  // Actions hệ thống
  setIsSaving: (isSaving: boolean) => void;
  setInitialData: (data: CvLayoutData) => void;
  fetchCv: (id: string) => Promise<void>;
  saveChanges: () => Promise<void>;
  triggerAutoSave: () => void;

  // Actions chỉnh sửa nội dung
  setTemplateId: (id: string) => void;
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  updateCvField: (field: string, value: any) => void;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;

  // Actions cấu trúc layout (DnD)
  reorderSections: (columnId: LayoutColumnId, newIds: string[]) => void;
  moveSection: (
    sectionId: string,
    sourceCol: LayoutColumnId,
    destCol: LayoutColumnId,
    index: number,
  ) => void;

  // Actions quản lý Section
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionContent: (sectionId: string, content: string) => void;

  // Actions quản lý Item bên trong Section
  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvItem,
    value: string,
  ) => void;
  addItem: (sectionId: string) => void;
  removeItem: (sectionId: string, itemId: string) => void;
}

// --- Dữ liệu mặc định (Khởi tạo khi tạo CV mới) ---
export const DEFAULT_CV_DATA: CvLayoutData = {
  template_id: "modern-01",
  personalInfo: {
    fullName: "NGUYỄN VĂN A",
    title: "FULLSTACK DEVELOPER",
    email: "hello@gmail.com",
    phone: "0123 456 789",
    address: "Quận 1, TP. Hồ Chí Minh",
    website: "github.com/nguyenvana",
  },
  theme: {
    template_id: "modern-01",
    font_family: "Inter",
    font_size: "14px",
    line_height: 1.5,
    primary_color: "#4f46e5", // Indigo-600
  },
  layout: {
    fullWidth: ["section-header"],
    leftColumn: ["section-skills"],
    rightColumn: [
      "section-summary",
      "section-exp",
      "section-edu",
      "section-projects",
    ],
    unused: [],
  },
  sections: [
    {
      id: "section-header",
      type: "header",
      title: "Thông tin cá nhân",
      visible: true,
      items: [],
    },
    {
      id: "section-summary",
      type: "summary",
      title: "Giới thiệu bản thân",
      visible: true,
      content:
        "Viết mục tiêu nghề nghiệp hoặc giới thiệu ngắn về bản thân bạn tại đây...",
      items: [],
    },
    {
      id: "section-exp",
      type: "experience",
      title: "Kinh nghiệm làm việc",
      visible: true,
      items: [
        {
          id: "exp-1",
          title: "SENIOR DEVELOPER",
          subtitle: "Công ty Công nghệ ABC",
          date: "2022 - Hiện tại",
          description: "Mô tả chi tiết công việc của bạn...",
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
          id: "edu-1",
          title: "KỸ THUẬT PHẦN MỀM",
          subtitle: "Đại học Sài Gòn",
          date: "2018 - 2022",
          description: "Mô tả quá trình học tập hoặc thành tích của bạn...",
        },
      ],
    },
    {
      id: "section-skills",
      type: "skills",
      title: "Kỹ năng",
      visible: true,
      items: [
        { id: "sk-1", title: "React/TypeScript" },
        { id: "sk-2", title: "Rust/Axum" },
      ],
    },
    {
      id: "section-projects",
      type: "projects",
      title: "Dự án tiêu biểu",
      visible: true,
      items: [
        {
          id: "pj-1",
          title: "HỆ THỐNG QUẢN LÝ CV",
          date: "2024",
          description: "Xây dựng hệ thống kéo thả CV chuyên nghiệp...",
        },
      ],
    },
  ],
};
