import { create } from "zustand";
import {
  CvLayoutData,
  CvSection,
  CvItem,
  CvTheme,
  DEFAULT_CV_DATA,
} from "../types/cv"; // Sử dụng đường dẫn tương đối để tránh lỗi Alias @/
import { cvService } from "../services/cvService";

// Interface cho lỗi để tránh dùng 'any'
interface StoreError {
  message: string;
}

interface CvStoreState {
  currentCvId: string | null;
  data: CvLayoutData;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  error: string | null;

  // Actions đồng bộ với API
  fetchCv: (id: string) => Promise<void>;
  saveChanges: () => Promise<void>;
  setIsSaving: (val: boolean) => void;
  markSaved: () => void;
  setInitialData: (data: CvLayoutData) => void;

  // Actions chỉnh sửa giao diện và dữ liệu
  updateTheme: (newTheme: Partial<CvTheme>) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvItem,
    value: string,
  ) => void;
  addItem: (sectionId: string, type: CvSection["type"]) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
}

// Helper tạo ID cho item mới
const generateId = () => Math.random().toString(36).substring(2, 11);

export const useCvStore = create<CvStoreState>((set, get) => ({
  currentCvId: null,
  data: DEFAULT_CV_DATA, // Hiển thị dữ liệu mẫu ngay khi chưa load xong API
  isSaving: false,
  isLoading: false,
  lastSaved: null,
  error: null,

  setInitialData: (data) => set({ data, isLoading: false }),
  setIsSaving: (val) => set({ isSaving: val }),

  markSaved: () =>
    set({
      isSaving: false,
      lastSaved: new Date(),
      error: null,
    }),

  // Cập nhật màu sắc/theme cho CV
  updateTheme: (newTheme) =>
    set((state) => ({
      data: {
        ...state.data,
        theme: { ...state.data.theme, ...newTheme },
      },
    })),

  // Ẩn/Hiện một mục trong CV
  toggleSectionVisibility: (sectionId) =>
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s,
        ),
      },
    })),

  fetchCv: async (id) => {
    set({ isLoading: true, error: null, currentCvId: id });
    try {
      const cv = await cvService.getById(id);
      set({ data: cv.layout_data, isLoading: false });
    } catch (err) {
      const error = err as StoreError;
      set({ error: error.message || "Lỗi tải CV", isLoading: false });
    }
  },

  saveChanges: async () => {
    const { currentCvId, data } = get();
    if (!currentCvId) return;
    set({ isSaving: true });
    try {
      await cvService.update(currentCvId, { layout_data: data });
      set({ isSaving: false, lastSaved: new Date() });
    } catch (err) {
      const error = err as StoreError;
      set({ isSaving: false, error: error.message });
    }
  },

  updateItemField: (sectionId, itemId, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map((i) =>
                  i.id === itemId ? { ...i, [field]: value } : i,
                ),
              }
            : s,
        ),
      },
    })),

  addItem: (sectionId, type) =>
    set((state) => {
      const newItem: CvItem = {
        id: generateId(),
        title: type === "experience" ? "Vị trí mới" : "Tiêu đề mới",
        subtitle: "",
        date: "2024 - Hiện tại",
        description: "",
      };
      return {
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s,
          ),
        },
      };
    }),

  removeItem: (sectionId, itemId) =>
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId
            ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
            : s,
        ),
      },
    })),

  reorderSections: (startIndex, endIndex) =>
    set((state) => {
      const sections = [...state.data.sections];
      const [removed] = sections.splice(startIndex, 1);
      sections.splice(endIndex, 0, removed);
      return { data: { ...state.data, sections } };
    }),
}));