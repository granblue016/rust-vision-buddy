import { create } from "zustand";
import {
  CvLayoutData,
  DEFAULT_CV_DATA,
  CvStoreState,
  LayoutColumnId,
  CvItem,
  PersonalInfo,
  CvTheme,
} from "../types/cv";
import { cvService } from "../services/cvService";

let saveTimeout: NodeJS.Timeout;

export const useCvStore = create<CvStoreState>((set, get) => ({
  // --- STATE BAN ĐẦU ---
  currentCvId: null,
  data: DEFAULT_CV_DATA,
  isSaving: false,
  isLoading: false,
  isDirty: false,
  error: null,
  lastSaved: null,

  // --- HỆ THỐNG & ĐỒNG BỘ ---
  setIsSaving: (isSaving: boolean) => set({ isSaving }),

  setInitialData: (data: CvLayoutData) =>
    set({ data, isDirty: false, isLoading: false }),

  fetchCv: async (id: string) => {
    if (!id) return;
    set({ isLoading: true, error: null, currentCvId: id });

    try {
      const cv = await cvService.getById(id);
      const incomingData = cv.layout_data || {};

      // Merge sâu để đảm bảo dữ liệu từ DB không làm mất các trường mới định nghĩa ở Frontend
      const mergedData: CvLayoutData = {
        ...DEFAULT_CV_DATA,
        ...incomingData,
        personalInfo: {
          ...DEFAULT_CV_DATA.personalInfo,
          ...(incomingData.personalInfo || {}),
        },
        theme: {
          ...DEFAULT_CV_DATA.theme,
          ...(incomingData.theme || {}),
        },
        layout: {
          ...DEFAULT_CV_DATA.layout,
          ...(incomingData.layout || {}),
        },
        sections:
          Array.isArray(incomingData.sections) &&
          incomingData.sections.length > 0
            ? incomingData.sections
            : DEFAULT_CV_DATA.sections,
      };

      set({ data: mergedData, isLoading: false, isDirty: false });
    } catch (err: any) {
      console.error("Fetch CV Error:", err);
      set({
        error: "Không thể kết nối đến máy chủ. Đang hiển thị dữ liệu mặc định.",
        data: DEFAULT_CV_DATA,
        isLoading: false,
      });
    }
  },

  saveChanges: async () => {
    const { currentCvId, data, isDirty, isSaving } = get();
    if (!currentCvId || !isDirty || isSaving) return;

    set({ isSaving: true });
    try {
      await cvService.update(currentCvId, { layout_data: data });
      set({
        isSaving: false,
        isDirty: false,
        lastSaved: new Date(),
        error: null,
      });
    } catch (err: any) {
      set({
        isSaving: false,
        error: "Lưu thất bại: " + (err.message || "Lỗi Server"),
      });
    }
  },

  triggerAutoSave: () => {
    set({ isDirty: true });
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      get().saveChanges();
    }, 3000); // Tự động lưu sau 3 giây nhàn rỗi
  },

  // --- ACTIONS CHỈNH SỬA NỘI DUNG ---

  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => {
    set((state) => ({
      data: {
        ...state.data,
        personalInfo: { ...state.data.personalInfo, [field]: value },
      },
    }));
    get().triggerAutoSave();
  },

  updateCvField: (field: string, value: any) => {
    set((state) => ({
      data: { ...state.data, [field]: value },
    }));
    get().triggerAutoSave();
  },

  updateSectionTitle: (sectionId: string, title: string) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId ? { ...s, title } : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },

  updateSectionContent: (sectionId: string, content: string) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId ? { ...s, content } : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },

  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvItem,
    value: string,
  ) => {
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
    }));
    get().triggerAutoSave();
  },

  // --- QUẢN LÝ THEME & LAYOUT ---

  setTemplateId: (id: string) => {
    set((state) => ({
      data: {
        ...state.data,
        template_id: id,
        theme: { ...state.data.theme, template_id: id },
      },
    }));
    get().triggerAutoSave();
  },

  updateTheme: (newTheme: Partial<CvTheme>) => {
    set((state) => ({
      data: { ...state.data, theme: { ...state.data.theme, ...newTheme } },
    }));
    get().triggerAutoSave();
  },

  // --- ACTIONS KÉO THẢ (DND) ---

  reorderSections: (columnId: LayoutColumnId, newIds: string[]) => {
    set((state) => ({
      data: {
        ...state.data,
        layout: { ...state.data.layout, [columnId]: newIds },
      },
    }));
    get().triggerAutoSave();
  },

  moveSection: (
    sectionId: string,
    sourceCol: LayoutColumnId,
    destCol: LayoutColumnId,
    index: number,
  ) => {
    set((state) => {
      const newLayout = { ...state.data.layout };
      const sourceList = Array.isArray(newLayout[sourceCol])
        ? [...newLayout[sourceCol]]
        : [];
      const destList = Array.isArray(newLayout[destCol])
        ? [...newLayout[destCol]]
        : [];

      const filteredSource = sourceList.filter((id) => id !== sectionId);
      destList.splice(index, 0, sectionId);

      newLayout[sourceCol] = filteredSource;
      newLayout[destCol] = destList;

      return { data: { ...state.data, layout: newLayout } };
    });
    get().triggerAutoSave();
  },

  // --- QUẢN LÝ MỤC (ITEMS) ---

  toggleSectionVisibility: (sectionId: string) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },

  addItem: (sectionId: string) => {
    set((state) => {
      const section = state.data.sections.find((s) => s.id === sectionId);
      if (!section) return state;

      const newItem: CvItem = {
        id: crypto.randomUUID(),
        title: "Tiêu đề mới",
        subtitle: "Mô tả phụ",
        date: "2024 - Hiện tại",
        description: "Mô tả chi tiết nội dung...",
      };

      return {
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId
              ? { ...s, items: [...(s.items || []), newItem] }
              : s,
          ),
        },
      };
    });
    get().triggerAutoSave();
  },

  removeItem: (sectionId: string, itemId: string) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: (s.items || []).filter((i) => i.id !== itemId),
              }
            : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },
}));
