/**
 * Thông tin cá nhân tập trung (Header)
 * Đã chuẩn hóa camelCase để khớp với Store và Backend
 */
export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  location?: string;
  website: string;
  avatar?: string;
}

/**
 * Định nghĩa Theme của CV
 * Đồng bộ tuyệt đối với Struct CvTheme trong Rust (#[serde(rename_all = "camelCase")])
 */
export interface CvTheme {
  fontFamily: string; // Ví dụ: "Inter, sans-serif"
  fontSize: string; // Ví dụ: "14px"
  lineHeight: number; // Ví dụ: 1.5
  primaryColor: string;
  templateId: string;
  secondaryColor?: string;
  backgroundImage?: string;
}

/**
 * Đơn vị dữ liệu nhỏ nhất trong một Section (Kinh nghiệm, Học vấn, Kỹ năng...)
 */
export interface CvItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  content?: string;
  description?: string;
  link?: string;
  email?: string;
  phone?: string;
  location?: string;
}

/**
 * Các loại Section được hỗ trợ trong hệ thống
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

/**
 * Cấu trúc một Section hoàn chỉnh
 */
export interface CvSection {
  id: string;
  type: CvSectionType;
  title: string;
  visible: boolean;
  content?: string;
  items: CvItem[];
}

/**
 * Trạng thái sắp xếp của các Section trên giao diện
 */
export interface CvLayoutState {
  fullWidth: string[];
  leftColumn: string[];
  rightColumn: string[];
  unused: string[];
}

/**
 * Dữ liệu layout chính (Lưu dạng JSONB trong Postgres)
 */
export interface CvLayoutData {
  templateId: string;
  language: "vi" | "en";
  personalInfo: PersonalInfo;
  theme: CvTheme;
  sections: CvSection[];
  layout: CvLayoutState;
}

/**
 * Interface đại diện cho một thực thể CV từ API (Model từ DB)
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
 * Request DTOs cho API
 */
export interface CreateCvRequest {
  name: string;
  templateId: string;
}

export interface UpdateCvRequest {
  name?: string;
  layout_data: CvLayoutData;
}

/**
 * Định nghĩa đầy đủ cho Zustand Store (Kế hoạch quản lý Font/Size)
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
  exportPdf: () => Promise<void>;

  // Action chuyển đổi ngôn ngữ
  setLanguage: (lang: "vi" | "en") => void;

  // Actions chỉnh sửa giao diện (Quan trọng cho Font/Size)
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

/**
 * Dữ liệu khởi tạo mặc định (Fallback data)
 * Đã thiết lập giá trị mặc định cho Font và Size chữ
 */
export const DEFAULT_CV_DATA: CvLayoutData = {
  templateId: "modern-01",
  language: "vi",
  personalInfo: {
    fullName: "NGUYỄN VĂN A",
    title: "FULLSTACK DEVELOPER",
    email: "hello@gmail.com",
    phone: "0123 456 789",
    address: "Quận 1, TP. Hồ Chí Minh",
    location: "Quận 1, TP. Hồ Chí Minh",
    website: "github.com/nguyenvana",
  },
  theme: {
    templateId: "modern-01",
    fontFamily: "Inter, sans-serif", // Font mặc định
    fontSize: "14px", // Size mặc định
    lineHeight: 1.5,
    primaryColor: "#4f46e5",
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
      items: [
        {
          id: "header-item-1",
          title: "NGUYỄN VĂN A",
          subtitle: "FULLSTACK DEVELOPER",
          email: "hello@gmail.com",
          phone: "0123 456 789",
          location: "Quận 1, TP. Hồ Chí Minh",
        },
      ],
    },
    {
      id: "section-summary",
      type: "summary",
      title: "Giới thiệu bản thân",
      visible: true,
      content: "Viết mục tiêu nghề nghiệp hoặc giới thiệu ngắn...",
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
          description: "Mô tả quá trình học tập...",
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
