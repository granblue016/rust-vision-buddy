import { create } from "zustand";
import {
  CvLayoutData,
  DEFAULT_CV_DATA,
  CvStoreState,
  LayoutColumnId,
  CvItem,
} from "../types/cv";
import { cvService } from "../services/cvService";

// Biến global để quản lý debounce tránh spam API
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

      // Merge sâu để bảo vệ cấu trúc dữ liệu: Đảm bảo UI không vỡ nếu DB cũ thiếu trường
      const mergedData: CvLayoutData = {
        ...DEFAULT_CV_DATA,
        ...incomingData,
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
    // Chặn lưu nếu: không có ID, dữ liệu chưa đổi (dirty), hoặc đang trong quá trình lưu
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
      console.log("✓ Cloud Synced:", new Date().toLocaleTimeString());
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
    }, 3000); // Đợi 3 giây sau thao tác cuối cùng để lưu tự động
  },

  // --- ACTIONS CHỈNH SỬA NỘI DUNG ---

  updateCvField: (field, value) => {
    set((state) => ({
      data: { ...state.data, [field]: value },
    }));
    get().triggerAutoSave();
  },

  updateSectionTitle: (sectionId, title) => {
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

  updateSectionContent: (sectionId, content) => {
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

  updateItemField: (sectionId, itemId, field, value) => {
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

  updateTheme: (newTheme) => {
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

  moveSection: (sectionId, sourceCol, destCol, index) => {
    set((state) => {
      const newLayout = { ...state.data.layout };

      // Xóa khỏi cột cũ
      newLayout[sourceCol] = (newLayout[sourceCol] || []).filter(
        (id) => id !== sectionId,
      );

      // Chèn vào vị trí mới ở cột đích
      const updatedDestCol = [...(newLayout[destCol] || [])];
      updatedDestCol.splice(index, 0, sectionId);
      newLayout[destCol] = updatedDestCol;

      return { data: { ...state.data, layout: newLayout } };
    });
    get().triggerAutoSave();
  },

  // --- QUẢN LÝ MỤC (ITEMS) & HIỂN THỊ ---

  toggleSectionVisibility: (sectionId) => {
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

  addItem: (sectionId) => {
    set((state) => {
      const section = state.data.sections.find((s) => s.id === sectionId);
      if (!section) return state;

      // Tạo item mới với ID chuẩn UUID hoặc fallback timestamp
      const newItem: CvItem = {
        id:
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${section.type}-${Date.now()}`,
        title: "",
        subtitle: "",
        date: "",
        description: "", // Dùng description đồng bộ với InlineRichText
      };

      return {
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s,
          ),
        },
      };
    });
    get().triggerAutoSave();
  },

  removeItem: (sectionId, itemId) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId
            ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
            : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },
}));
