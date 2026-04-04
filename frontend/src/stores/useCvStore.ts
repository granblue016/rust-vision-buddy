import { create } from "zustand";
import {
  CvLayoutData,
  DEFAULT_CV_DATA,
  CvStoreState,
  PersonalInfo,
  CvTheme,
  CvItem,
  CvLayoutState,
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
 * HELPER: Loại bỏ HTML tag cho các trường Plain Text (như Tên CV).
 */
const stripHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
};

export const useCvStore = create<CvStoreState>((set, get) => ({
  currentCvId: null,
  name: "CV mới chưa đặt tên",
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
      const res = response as any;

      const incoming = res.layoutData || res.layout_data || {};

      // --- CHIẾN THUẬT LỌC DỮ LIỆU TẠI ĐÂY ---
      if (incoming.personalInfo) {
        // Chỉ lọc bỏ tên nếu khớp với chuỗi mặc định từ Backend
        if (incoming.personalInfo.fullName === "NGUYỄN VĂN ABCDEFFFG") {
          incoming.personalInfo.fullName = "";
        }
        // Giữ nguyên title (Vị trí ứng tuyển) không lọc bỏ
      }
      // ---------------------------------------

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

      set({
        data: mergedData,
        name: stripHtml(res.name) || "CV mới chưa đặt tên",
        isLoading: false,
        isDirty: false,
      });
    } catch (err) {
      set({ error: "Không thể tải dữ liệu CV", isLoading: false });
    }
  },

  saveChanges: async () => {
    const state = get();
    if (!state.currentCvId || !state.isDirty || state.isSaving || !state.data)
      return;

    set({ isSaving: true });
    try {
      const { data, name, currentCvId } = state;

      const payload = {
        name: stripHtml(name),
        layoutData: {
          ...data,
          personalInfo: {
            ...data.personalInfo,
            fullName: data.personalInfo.fullName || name, // Ưu tiên fullName, nếu rỗng thì dùng name CV
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

  updateCvName: (newName: string) =>
    set((state) => ({
      name: newName,
      isDirty: true,
      data: state.data
        ? {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, fullName: newName },
          }
        : null,
    })),

  updatePersonalInfo: (updates: Partial<PersonalInfo>) =>
    set((state) => {
      if (!state.data) return state;

      const nameUpdate = updates.fullName ? { name: updates.fullName } : {};

      return {
        ...nameUpdate,
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

  moveSection: (
    sectionId: string,
    sourceCol: keyof CvLayoutState,
    destCol: keyof CvLayoutState,
    index: number,
  ) =>
    set((state) => {
      if (!state.data) return state;
      const newLayout = { ...state.data.layout };

      newLayout[sourceCol] = newLayout[sourceCol].filter(
        (id) => id !== sectionId,
      );
      newLayout[destCol].splice(index, 0, sectionId);

      return {
        isDirty: true,
        data: { ...state.data, layout: newLayout },
      };
    }),

  updateCvField: (field: keyof CvLayoutData, value: any) =>
    set((state) => {
      if (!state.data) return state;
      return {
        isDirty: true,
        data: { ...state.data, [field]: value },
      };
    }),

  toggleSectionVisibility: (sectionId: string) =>
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

  updateSectionTitle: (sectionId: string, title: string) =>
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

  updateSectionContent: (sectionId: string, content: string | null) =>
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

  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvItem,
    value: string | null,
  ) =>
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

  addItem: (sectionId: string) =>
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

  removeItem: (sectionId: string, itemId: string) =>
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

  reorderSections: (columnId: keyof CvLayoutState, newIds: string[]) =>
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

  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  setInitialData: (data: CvLayoutData) => set({ data, isDirty: false }),
  triggerAutoSave: () => set({ isDirty: true }),

  setLanguage: (lang: "vi" | "en") =>
    set((state) => ({
      isDirty: true,
      data: state.data ? { ...state.data, language: lang } : null,
    })),

  setTemplateId: (id: string) =>
    set((state) => ({
      isDirty: true,
      data: state.data ? { ...state.data, templateId: id } : null,
    })),

  exportPdf: async () => {
    window.print();
  },
}));

export default useCvStore;
