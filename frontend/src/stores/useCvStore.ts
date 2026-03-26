import { create } from "zustand";
import { CvLayoutData, DEFAULT_CV_DATA, CvStoreState } from "../types/cv";
import { cvService } from "../services/cvService";

const FONT_SIZE_MAP: Record<string, string> = {
  Nhỏ: "12px",
  Vừa: "14px",
  Lớn: "16px",
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * HELPER: Chuẩn hóa văn bản
 */
const cleanPlainText = (text: string | undefined | null): string => {
  if (typeof text !== "string" || !text) return "";
  return text
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
};

/**
 * HELPER: Chuyển chuỗi rỗng về null để khớp với Option<String> trong Rust
 */
const toOption = (text: any): string | null => {
  if (text === undefined || text === null) return null;
  const cleaned = typeof text === "string" ? text.trim() : String(text).trim();
  return cleaned === "" ? null : cleaned;
};

const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);

/**
 * CHUẨN HÓA DỮ LIỆU GỬI LÊN RUST - KHỚP 100% MODELS.RS
 */
const cleanDataForStorage = (data: CvLayoutData): any => {
  return {
    templateId: data.templateId || "modern-01",
    personalInfo: {
      fullName: data.personalInfo?.fullName || "",
      title: data.personalInfo?.title || "",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone || "",
      address: data.personalInfo?.address || "",
      website: data.personalInfo?.website || "",
      avatar: data.personalInfo?.avatar || null, // Option<String> -> null
    },
    theme: {
      fontFamily: data.theme?.fontFamily || "Inter",
      fontSize: data.theme?.fontSize || "14px",
      lineHeight: parseFloat(String(data.theme?.lineHeight || 1.5)),
      primaryColor: data.theme?.primaryColor || "#4f46e5",
      templateId: data.theme?.templateId || "modern-01",
    },
    sections: (data.sections || []).map((s) => ({
      id: s.id,
      type: s.type || "experience", // Rust: rename "type"
      title: s.title || "",
      visible: Boolean(s.visible),
      content: s.content || null,
      items: (s.items || []).map((item) => ({
        id: item.id,
        title: item.title || "",
        subtitle: item.subtitle || null,
        date: item.date || null,
        description: item.description || null,
        email: item.email || null,
        phone: item.phone || null,
        location: item.location || null,
        link: (item as any).link || null, // Phải có trường link như models.rs
      })),
    })),
    layout: {
      // Rust dùng alias "column-1" nhưng vẫn nhận fullWidth do camelCase
      fullWidth: data.layout?.fullWidth || [],
      leftColumn: data.layout?.leftColumn || [],
      rightColumn: data.layout?.rightColumn || [],
      unused: data.layout?.unused || [],
    },
  };
};

export const useCvStore = create<CvStoreState>((set, get) => ({
  currentCvId: null,
  data: JSON.parse(JSON.stringify(DEFAULT_CV_DATA)),
  isSaving: false,
  isLoading: false,
  isDirty: false,
  error: null,
  lastSaved: null,

  setIsSaving: (isSaving: boolean) => set({ isSaving }),

  setInitialData: (data: CvLayoutData) =>
    set({
      data: { ...data },
      isDirty: false,
      isLoading: false,
    }),

  setLanguage: (lang: "vi" | "en") => {
    set((state) => ({ data: { ...state.data, language: lang } }));
    get().triggerAutoSave();
  },

  fetchCv: async (id: string) => {
    if (!id) return;
    set({ isLoading: true, error: null, currentCvId: id });
    try {
      const response = (await cvService.getById(id)) as any;
      const incoming = response.layout_data || response.layoutData || {};

      // Merge dữ liệu từ Backend về Frontend State
      const mergedData: CvLayoutData = {
        ...DEFAULT_CV_DATA,
        ...incoming,
        personalInfo: {
          ...DEFAULT_CV_DATA.personalInfo,
          ...(incoming.personalInfo || {}),
        },
        theme: {
          ...DEFAULT_CV_DATA.theme,
          ...(incoming.theme || {}),
          fontSize:
            Object.keys(FONT_SIZE_MAP).find(
              (key) => FONT_SIZE_MAP[key] === incoming.theme?.fontSize,
            ) ||
            incoming.theme?.fontSize ||
            "Vừa",
        },
      };

      set({ data: mergedData, isLoading: false, isDirty: false });
    } catch (err) {
      set({ error: "Không thể tải dữ liệu CV", isLoading: false });
    }
  },

  // Trong hàm saveChanges của useCvStore:
  saveChanges: async () => {
    const { currentCvId, data, isDirty, isSaving } = get();
    if (!currentCvId || !isDirty || isSaving) return;

    set({ isSaving: true });
    try {
      const cleanedLayoutData = cleanDataForStorage(data);

      // CỰC KỲ QUAN TRỌNG:
      // Struct UpdateCvRequest cũng dùng rename_all = "camelCase"
      // Nên layout_data phải viết là layoutData
      const payload = {
        name: data.personalInfo?.fullName || "Untitled CV",
        layoutData: cleanedLayoutData, // KHÔNG ĐƯỢC để layout_data
      };

      await cvService.update(currentCvId, payload as any);

      set({
        isSaving: false,
        isDirty: false,
        lastSaved: new Date(),
        error: null,
      });
    } catch (err: any) {
      set({ isSaving: false, error: "Lỗi đồng bộ dữ liệu (422)" });
      console.error(
        "Payload gửi đi bị lỗi cấu trúc:",
        cleanDataForStorage(data),
      );
    }
  },

  triggerAutoSave: () => {
    set({ isDirty: true });
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => get().saveChanges(), 1500);
  },

  updateCvField: (field, value) => {
    set((state) => ({ data: { ...state.data, [field]: value } }));
    get().triggerAutoSave();
  },

  updatePersonalInfo: (field, value) => {
    set((state) => ({
      data: {
        ...state.data,
        personalInfo: { ...state.data.personalInfo, [field]: value },
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
                items: (s.items || []).map((i) =>
                  i.id === itemId ? { ...i, [field]: value } : i,
                ),
              }
            : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },

  addItem: (sectionId) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: [
                  ...(s.items || []),
                  {
                    id: crypto.randomUUID(),
                    title: "Mục mới",
                    subtitle: "",
                    date: "",
                    description: "",
                    location: "",
                    email: "",
                    phone: "",
                    link: "", // Khởi tạo link
                  },
                ],
              }
            : s,
        ),
      },
    }));
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

  reorderSections: (columnId, newIds) => {
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
      const layout = { ...state.data.layout };
      const sourceList = [...(layout[sourceCol] || [])];
      const destList =
        sourceCol === destCol ? sourceList : [...(layout[destCol] || [])];
      const sourceIdx = sourceList.indexOf(sectionId);
      if (sourceIdx > -1) {
        sourceList.splice(sourceIdx, 1);
        destList.splice(index, 0, sectionId);
      }
      return {
        data: {
          ...state.data,
          layout: { ...layout, [sourceCol]: sourceList, [destCol]: destList },
        },
      };
    });
    get().triggerAutoSave();
  },

  exportPdf: async () => {
    const { currentCvId } = get();
    if (!currentCvId) return;
    set({ isSaving: true });
    try {
      const response = await cvService.exportPdf(currentCvId);
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `CV_${get().data.personalInfo.fullName || "Export"}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      set({ isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: "Lỗi xuất PDF" });
    }
  },

  setTemplateId: (id: string) => {
    set((state) => ({ data: { ...state.data, templateId: id } }));
    get().triggerAutoSave();
  },
}));
