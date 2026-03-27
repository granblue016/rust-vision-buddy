/**
 * Thông tin cá nhân (Header)
 * Chuẩn hóa camelCase để khớp với Store và Backend Rust
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
 * Đồng bộ tuyệt đối với Struct CvTheme trong Rust
 */
export interface CvTheme {
  fontFamily: string; // Ví dụ: "Inter, sans-serif"
  fontSize: string; // Ví dụ: "14px"
  lineHeight: number; // Ví dụ: 1.5
  primaryColor: string;
  templateId: string; // QUAN TRỌNG: Đồng bộ với logic đa template
  secondaryColor?: string;
  backgroundImage?: string;
}

/**
 * Đơn vị dữ liệu nhỏ nhất trong một Section
 * Sử dụng thống nhất tên CvItem (Thay thế cho CvSectionItem cũ)
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
 * Dữ liệu layout chính (Khớp với Json<CvLayoutData> trong Rust)
 * Sử dụng thống nhất tên CvLayoutData (Thay thế cho CvData cũ)
 */
export interface CvLayoutData {
  templateId: string; // ID mẫu CV (e.g., "harvard-01", "modern-01")
  language: "vi" | "en";
  personalInfo: PersonalInfo;
  theme: CvTheme;
  sections: CvSection[];
  layout: CvLayoutState;
}

/**
 * Interface thực thể CV từ API
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
 * DTOs cho API Requests
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
 * Định nghĩa Zustand Store State & Actions
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

  // Actions dữ liệu
  setLanguage: (lang: "vi" | "en") => void;
  setTemplateId: (id: string) => void;
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  updateCvField: (field: string, value: any) => void;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;

  // Actions Layout (DnD)
  reorderSections: (columnId: LayoutColumnId, newIds: string[]) => void;
  moveSection: (
    sectionId: string,
    sourceCol: LayoutColumnId,
    destCol: LayoutColumnId,
    index: number,
  ) => void;

  // Actions Section
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionContent: (sectionId: string, content: string) => void;

  // Actions Item
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
 * Dữ liệu mặc định (Dùng cho tạo mới CV hoặc fallback)
 */
export const DEFAULT_CV_DATA: CvLayoutData = {
  templateId: "harvard-01",
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
    templateId: "harvard-01",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    lineHeight: 1.5,
    primaryColor: "#1a1a1a",
  },
  layout: {
    fullWidth: [
      "section-header",
      "section-summary",
      "section-exp",
      "section-edu",
      "section-skills",
      "section-projects",
    ],
    leftColumn: [],
    rightColumn: [],
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
      title: "Tóm tắt chuyên môn",
      visible: true,
      content: "Nhập tóm tắt chuyên môn của bạn tại đây...",
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
          title: "Vị trí công việc",
          subtitle: "Tên công ty",
          date: "2022 - Hiện tại",
          description: "Mô tả các thành tựu và công việc...",
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
          title: "Tên ngành học",
          subtitle: "Tên trường đại học",
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
        { id: "sk-1", title: "Kỹ năng 1" },
        { id: "sk-2", title: "Kỹ năng 2" },
      ],
    },
    {
      id: "section-projects",
      type: "projects",
      title: "Dự án",
      visible: true,
      items: [
        {
          id: "pj-1",
          title: "Tên dự án",
          date: "2024",
          description: "Mô tả ngắn gọn về dự án...",
        },
      ],
    },
  ],
};
