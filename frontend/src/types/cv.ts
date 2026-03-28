/**
 * Thông tin cá nhân
 * Khớp tuyệt đối với struct PersonalInfo trong Rust
 * Lưu ý: Rust dùng snake_case nội bộ nhưng JSON nhận/gửi là camelCase
 */
export interface PersonalInfo {
  fullName: string; // Rust: full_name
  title: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  avatar: string | null; // Rust: Option<String>
}

/**
 * Định nghĩa Theme của CV
 * Khớp tuyệt đối với struct CvTheme trong Rust
 */
export interface CvTheme {
  fontFamily: string; // Rust: font_family
  fontSize: string; // Rust: font_size
  lineHeight: number; // Rust: line_height (f32)
  primaryColor: string;
  templateId: string;
}

/**
 * Đơn vị dữ liệu nhỏ nhất trong một Section
 * Khớp tuyệt đối với struct CvSectionItem trong Rust
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
 * Định nghĩa cấu trúc Section
 */
export interface CvSection {
  id: string;
  type: string; // Rust dùng r#type, JSON là "type"
  title: string;
  visible: boolean;
  content: string | null;
  items: CvItem[];
}

/**
 * Trạng thái bố cục (Layout)
 */
export interface CvLayoutState {
  fullWidth: string[];
  leftColumn: string[];
  rightColumn: string[];
  unused: string[];
}

/**
 * Dữ liệu toàn bộ CV (Dữ liệu logic)
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
 * Model CV từ Database
 * SỬA LỖI QUAN TRỌNG: layout_data -> layoutData để khớp với Serde camelCase của Rust
 */
export interface Cv {
  id: string;
  userId: string; // Chuẩn hóa camelCase cho user_id
  name: string;
  layoutData: CvLayoutData; // Đã đổi từ layout_data -> layoutData
  createdAt: string; // Chuẩn hóa camelCase cho created_at
  updatedAt: string; // Chuẩn hóa camelCase cho updated_at
}

/**
 * Định nghĩa Zustand Store State & Actions
 */
export interface CvStoreState {
  currentCvId: string | null;
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

  // Actions dữ liệu tổng quát
  setLanguage: (lang: "vi" | "en") => void;
  setTemplateId: (id: string) => void;
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  updateCvField: (field: keyof CvLayoutData, value: any) => void;
  updateCvName: (name: string) => void;
  updatePersonalInfo: (updates: Partial<PersonalInfo>) => void;

  // Actions Layout (DnD)
  reorderSections: (columnId: keyof CvLayoutState, newIds: string[]) => void;
  moveSection: (
    sectionId: string,
    sourceCol: keyof CvLayoutState,
    destCol: keyof CvLayoutState,
    index: number,
  ) => void;

  // Actions Section
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionContent: (sectionId: string, content: string | null) => void;

  // Actions Item
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
 * Dữ liệu mặc định khởi tạo
 */
export const DEFAULT_CV_DATA: CvLayoutData = {
  templateId: "modern-01",
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
    templateId: "modern-01",
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
