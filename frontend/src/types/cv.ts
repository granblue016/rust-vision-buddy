/**
 * Thông tin cá nhân - Khớp tuyệt đối với Backend Rust
 */
export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  avatar: string | null;
}

/**
 * Cấu hình giao diện (Theme)
 */
export interface CvTheme {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  primaryColor: string;
  templateId: string;
}

/**
 * Item chi tiết trong một Section (Ví dụ: Một công việc trong Kinh nghiệm)
 */
export interface CvItem {
  id: string;
  title: string;
  subtitle: string | null;
  date: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  link: string | null;
}

/**
 * Định nghĩa một Section (Kinh nghiệm, Học vấn, Kỹ năng...)
 */
export interface CvSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  content: string | null;
  items: CvItem[];
}

/**
 * Quản lý Layout - Chìa khóa giải quyết lỗi TS
 */
// 1. Định nghĩa tập hợp các ID cột hợp lệ
export type LayoutColumnId =
  | "fullWidth"
  | "leftColumn"
  | "rightColumn"
  | "unused";

// 2. Thêm Index Signature [key: string] để cho phép truy cập layout[key] an toàn
export interface CvLayoutState {
  fullWidth: string[];
  leftColumn: string[];
  rightColumn: string[];
  unused: string[];
  /**
   * Index Signature: Cho phép truy cập động bằng string.
   * Giải quyết lỗi: "Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'CvLayoutState'"
   */
  [key: string]: string[];
}

/**
 * Cấu trúc dữ liệu chính của CV
 */
export interface CvLayoutData {
  templateId: string;
  personalInfo: PersonalInfo;
  theme: CvTheme;
  sections: CvSection[];
  layout: CvLayoutState;
  language?: "vi" | "en";
}

/**
 * Đối tượng CV đầy đủ từ DB
 */
export interface Cv {
  id: string;
  userId: string;
  name: string;
  layoutData: CvLayoutData;
  createdAt: string;
  updatedAt: string;
}

/**
 * Định nghĩa Zustand Store State & Actions
 */
export interface CvStoreState {
  currentCvId: string | null;
  name: string;
  data: CvLayoutData | null;
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

  // Actions cập nhật dữ liệu
  updateCvName: (newName: string) => void;
  setLanguage: (lang: "vi" | "en") => void;
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  updatePersonalInfo: (updates: Partial<PersonalInfo>) => void;

  // Cập nhật field bất kỳ trong CvLayoutData
  updateCvField: <K extends keyof CvLayoutData>(
    field: K,
    value: CvLayoutData[K],
  ) => void;

  // DnD & Layout (Sử dụng LayoutColumnId thay vì string chung chung)
  reorderSections: (columnId: LayoutColumnId, newIds: string[]) => void;
  moveSection: (
    sectionId: string,
    sourceCol: LayoutColumnId,
    destCol: LayoutColumnId,
    index: number,
  ) => void;

  // Section & Item management
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionContent: (sectionId: string, content: string | null) => void;
  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvItem,
    value: string | null,
  ) => void;
  addItem: (sectionId: string) => void;
  removeItem: (sectionId: string, itemId: string) => void;
}

/**
 * Dữ liệu mặc định cho CV mới
 * ĐÃ KIỂM TRA: Đảm bảo fullName và các trường thông tin đều để trống.
 */
export const DEFAULT_CV_DATA: CvLayoutData = {
  templateId: "standard-01",
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    avatar: null,
  },
  theme: {
    templateId: "standard-01",
    fontFamily: "Inter",
    fontSize: "14px",
    lineHeight: 1.5,
    primaryColor: "#4f46e5",
  },
  layout: {
    fullWidth: [],
    leftColumn: [],
    rightColumn: [],
    unused: [],
  },
  sections: [],
};
