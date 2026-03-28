import { create } from "zustand";
import {
  CvLayoutData,
  DEFAULT_CV_DATA,
  CvStoreState,
  PersonalInfo,
  CvTheme,
  CvItem,
} from "../types/cv";
import { cvService } from "../services/cvService";

/**
 * HELPER: Chuyển chuỗi rỗng thành null để khớp với Option<String> trong Rust.
 */
const toOption = (text: any): string | null => {
  if (text === undefined || text === null) return null;
  const cleaned = String(text).trim();
  return cleaned === "" ? null : cleaned;
};

/**
 * HELPER: Loại bỏ HTML tag cho các trường Plain Text.
 */
const stripHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
};

export const useCvStore = create<CvStoreState>((set, get) => ({
  currentCvId: null,
  data: JSON.parse(JSON.stringify(DEFAULT_CV_DATA)),
  isSaving: false,
  isLoading: false,
  isDirty: false,
  error: null,
  lastSaved: null,

  fetchCv: async (id: string) => {
    if (!id) return;
    set({ isLoading: true, error: null, currentCvId: id });
    try {
      const response = await cvService.getById(id);

      // CHUẨN HÓA: Rust trả về layout_data (snake) nhưng model TS mong đợi layoutData (camel)
      // Ta lấy dữ liệu linh hoạt từ response
      const res = response as any;
      const incoming = res.layoutData || res.layout_data || {};

      const mergedData: CvLayoutData = {
        ...DEFAULT_CV_DATA,
        ...incoming,
        personalInfo: {
          ...DEFAULT_CV_DATA.personalInfo,
          ...(incoming.personalInfo || {}),
        },
        theme: { ...DEFAULT_CV_DATA.theme, ...(incoming.theme || {}) },
        layout: { ...DEFAULT_CV_DATA.layout, ...(incoming.layout || {}) },
      };

      set({ data: mergedData, isLoading: false, isDirty: false });
    } catch (err) {
      set({ error: "Không thể tải dữ liệu CV", isLoading: false });
    }
  },

  saveChanges: async () => {
    const { currentCvId, data, isDirty, isSaving } = get();
    // Kiểm tra an toàn trước khi lưu
    if (!currentCvId || !isDirty || isSaving || !data) return;

    set({ isSaving: true });
    try {
      /**
       * PAYLOAD CHUẨN CAMELCASE:
       * Khớp tuyệt đối với struct UpdateCvRequest { layout_data: CvLayoutData }
       * đã được Backend dùng #[serde(rename_all = "camelCase")].
       */
      const payload = {
        name: stripHtml(data.personalInfo.fullName || "CV mới"),
        layoutData: {
          // ĐỔI TỪ layout_data -> layoutData (QUAN TRỌNG NHẤT)
          ...data,
          personalInfo: {
            ...data.personalInfo,
            avatar: toOption(data.personalInfo.avatar),
          },
          sections: data.sections.map((s) => ({
            ...s,
            content: toOption(s.content),
            items: s.items.map((i) => ({
              ...i,
              subtitle: toOption(i.subtitle),
              description: toOption(i.description),
              date: toOption(i.date),
              location: toOption(i.location),
              link: toOption(i.link),
            })),
          })),
        },
      };

      await cvService.update(currentCvId, payload as any);
      set({ isSaving: false, isDirty: false, lastSaved: new Date() });
    } catch (err) {
      console.error("Save Error:", err);
      set({ isSaving: false, error: "Lỗi khi lưu dữ liệu tự động" });
    }
  },

  // --- ACTIONS CẬP NHẬT DỮ LIỆU (Đã xử lý check null tránh lỗi TS) ---

  updateCvName: (name: string) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: {
          ...state.data,
          personalInfo: { ...state.data.personalInfo, fullName: name },
        },
      };
    }),

  updatePersonalInfo: (updates: Partial<PersonalInfo>) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: {
          ...state.data,
          personalInfo: { ...state.data.personalInfo, ...updates },
        },
      };
    }),

  updateTheme: (newTheme: Partial<CvTheme>) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: { ...state.data, theme: { ...state.data.theme, ...newTheme } },
      };
    }),

  moveSection: (sectionId, sourceCol, destCol, index) =>
    set((state) => {
      if (!state.data) return state;
      const newLayout = { ...state.data.layout };
      // Xóa khỏi cột cũ
      newLayout[sourceCol] = newLayout[sourceCol].filter(
        (id) => id !== sectionId,
      );
      // Chèn vào vị trí mới ở cột mới
      newLayout[destCol].splice(index, 0, sectionId);
      return {
        isDirty: true,
        data: { ...state.data, layout: newLayout },
      };
    }),

  updateCvField: (field, value) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: { ...state.data, [field]: value },
      };
    }),

  toggleSectionVisibility: (sectionId) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId ? { ...s, visible: !s.visible } : s,
          ),
        },
      };
    }),

  updateSectionTitle: (sectionId, title) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId ? { ...s, title } : s,
          ),
        },
      };
    }),

  updateSectionContent: (sectionId, content) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId ? { ...s, content } : s,
          ),
        },
      };
    }),

  updateItemField: (sectionId, itemId, field, value) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
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
      };
    }),

  // --- ACTIONS QUẢN LÝ DANH SÁCH ---

  addItem: (sectionId) =>
    set((state) => {
      if (!state.data) return state;
      const newItem: CvItem = {
        id: crypto.randomUUID(),
        title: "Tiêu đề mới",
        subtitle: null,
        date: null,
        description: null,
        email: null,
        phone: null,
        location: null,
        link: null,
      };
      return {
        isDirty: true,
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s,
          ),
        },
      };
    }),

  removeItem: (sectionId, itemId) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: {
          ...state.data,
          sections: state.data.sections.map((s) =>
            s.id === sectionId
              ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
              : s,
          ),
        },
      };
    }),

  reorderSections: (columnId, newIds) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: {
          ...state.data,
          layout: { ...state.data.layout, [columnId]: newIds },
        },
      };
    }),

  // --- ACTIONS HỆ THỐNG ---

  setIsSaving: (isSaving) => set({ isSaving }),
  setInitialData: (data) => set({ data, isDirty: false }),
  triggerAutoSave: () => set({ isDirty: true }),
  setLanguage: (lang) =>
    set((state) => ({
      isDirty: true,
      data: state.data ? { ...state.data, language: lang } : null,
    })),
  setTemplateId: (id) =>
    set((state) => ({
      isDirty: true,
      data: state.data ? { ...state.data, templateId: id } : null,
    })),
  exportPdf: async () => {
    window.print();
  },
}));

export default useCvStore;
