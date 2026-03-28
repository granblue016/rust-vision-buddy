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

export interface CvTheme {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  primaryColor: string;
  templateId: string;
}

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

export interface CvSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  content: string | null;
  items: CvItem[];
}

export interface CvLayoutState {
  fullWidth: string[];
  leftColumn: string[];
  rightColumn: string[];
  unused: string[];
}

export interface CvLayoutData {
  templateId: string;
  personalInfo: PersonalInfo;
  theme: CvTheme;
  sections: CvSection[];
  layout: CvLayoutState;
  language?: "vi" | "en";
}

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
 * Đã bổ sung các trường và action bị thiếu trong ảnh lỗi của bạn
 */
export interface CvStoreState {
  currentCvId: string | null;
  name: string; // Sửa lỗi ts(2353) và ts(2339)
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

  // Actions cập nhật dữ liệu (Quan trọng)
  updateCvName: (newName: string) => void;
  setLanguage: (lang: "vi" | "en") => void;
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  updatePersonalInfo: (updates: Partial<PersonalInfo>) => void;

  // Sửa lỗi ts(7006) trong useCvStore.ts
  updateCvField: <K extends keyof CvLayoutData>(
    field: K,
    value: CvLayoutData[K],
  ) => void;

  // DnD & Layout
  reorderSections: (columnId: keyof CvLayoutState, newIds: string[]) => void;
  moveSection: (
    sectionId: string,
    sourceCol: keyof CvLayoutState,
    destCol: keyof CvLayoutState,
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
  layout: { fullWidth: [], leftColumn: [], rightColumn: [], unused: [] },
  sections: [],
};
