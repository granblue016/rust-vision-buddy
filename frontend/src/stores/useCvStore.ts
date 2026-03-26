import { create } from "zustand";
import { CvLayoutData, DEFAULT_CV_DATA, CvStoreState } from "../types/cv";
import { cvService } from "../services/cvService";

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * 1. Làm sạch Text thuần: Xóa thẻ HTML cho các trường không hỗ trợ Rich Text.
 */
const cleanPlainText = (html: string | undefined | null): string => {
  if (!html) return "";
  return html
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
};

/**
 * 2. CHUẨN HÓA DỮ LIỆU GỬI LÊN RUST:
 * Đã thêm trường 'language' để Backend lưu trữ tùy chọn ngôn ngữ.
 */
const cleanDataForStorage = (data: CvLayoutData): any => {
  const rawLayout = (data.layout || {}) as any;

  const backendLayout = {
    fullWidth: Array.isArray(rawLayout.fullWidth)
      ? rawLayout.fullWidth
      : rawLayout["column-1"] || [],
    leftColumn: Array.isArray(rawLayout.leftColumn)
      ? rawLayout.leftColumn
      : rawLayout["column-2"] || [],
    rightColumn: Array.isArray(rawLayout.rightColumn)
      ? rawLayout.rightColumn
      : rawLayout["column-3"] || [],
    unused: Array.isArray(rawLayout.unused) ? rawLayout.unused : [],
  };

  return {
    templateId: data.theme?.templateId || "modern-01",
    // QUAN TRỌNG: Lưu tùy chọn ngôn ngữ UI
    language: data.language || "vi",
    personalInfo: {
      fullName: cleanPlainText(data.personalInfo?.fullName),
      title: cleanPlainText(data.personalInfo?.title),
      email: cleanPlainText(data.personalInfo?.email),
      phone: cleanPlainText(data.personalInfo?.phone),
      address: cleanPlainText(data.personalInfo?.address),
      website: cleanPlainText(
        (data.personalInfo as any)?.website || (data.personalInfo as any)?.link,
      ),
      avatar: data.personalInfo?.avatar || "",
    },
    theme: {
      primaryColor: data.theme?.primaryColor || "#4f46e5",
      fontFamily: data.theme?.fontFamily || "Inter",
      fontSize: data.theme?.fontSize || "Vừa",
      lineHeight: Number(data.theme?.lineHeight) || 1.5,
    },
    layout: backendLayout,
    sections: (data.sections || []).map((s) => ({
      ...s,
      id: s.id || crypto.randomUUID(),
      title: s.title, // Giữ nguyên nội dung người dùng nhập
      content: s.content || "",
      items: (s.items || []).map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        title: cleanPlainText(item.title),
        subtitle: cleanPlainText(item.subtitle),
        date: cleanPlainText(item.date),
        description: item.description || "",
      })),
    })),
  };
};

// Định nghĩa thêm Action trong Interface nếu TypeScript yêu cầu
// interface CvStoreState { ... setLanguage: (lang: "vi" | "en") => void; }

export const useCvStore = create<CvStoreState>((set, get) => ({
  currentCvId: null,
  // Thêm language: "vi" vào dữ liệu mặc định
  data: { ...JSON.parse(JSON.stringify(DEFAULT_CV_DATA)), language: "vi" },
  isSaving: false,
  isLoading: false,
  isDirty: false,
  error: null,
  lastSaved: null,

  setIsSaving: (isSaving: boolean) => set({ isSaving }),

  setInitialData: (data: CvLayoutData) =>
    set({
      data: { ...data, language: data.language || "vi" },
      isDirty: false,
      isLoading: false,
    }),

  /**
   * Cập nhật Ngôn ngữ UI (Chỉ đổi nhãn, không dịch nội dung)
   */
  setLanguage: (lang: "vi" | "en") => {
    set((state) => ({
      data: { ...state.data, language: lang },
    }));
    get().triggerAutoSave();
  },

  fetchCv: async (id: string) => {
    if (!id) return;
    set({ isLoading: true, error: null, currentCvId: id });
    try {
      const cv = (await cvService.getById(id)) as any;
      const incoming = cv.layout_data || cv.layoutData || {};
      const pInfo = incoming.personalInfo || {};
      const theme = incoming.theme || {};

      const mergedData: CvLayoutData = {
        ...DEFAULT_CV_DATA,
        ...incoming,
        // Đảm bảo language được map từ Backend về
        language: incoming.language || "vi",
        templateId:
          incoming.templateId ||
          (incoming as any).template_id ||
          DEFAULT_CV_DATA.theme.templateId,
        personalInfo: {
          ...DEFAULT_CV_DATA.personalInfo,
          ...pInfo,
          website: pInfo.website || (pInfo as any).link || "",
        },
        theme: {
          ...DEFAULT_CV_DATA.theme,
          ...theme,
          primaryColor:
            theme.primaryColor || (theme as any).primary_color || "#4f46e5",
          fontFamily: theme.fontFamily || (theme as any).font_family || "Inter",
        },
        layout: incoming.layout || DEFAULT_CV_DATA.layout,
        sections:
          Array.isArray(incoming.sections) && incoming.sections.length > 0
            ? incoming.sections
            : DEFAULT_CV_DATA.sections,
      };

      set({ data: mergedData, isLoading: false, isDirty: false });
    } catch (err) {
      set({ error: "Lỗi tải dữ liệu", isLoading: false });
    }
  },

  saveChanges: async () => {
    const { currentCvId, data, isDirty, isSaving } = get();
    if (!currentCvId || !isDirty || isSaving) return;

    set({ isSaving: true });
    try {
      const cleanedData = cleanDataForStorage(data);
      await cvService.update(currentCvId, { layoutData: cleanedData } as any);
      set({ isSaving: false, isDirty: false, lastSaved: new Date() });
    } catch (err) {
      console.error("Auto-save failed:", err);
      set({ isSaving: false, error: "Lưu thất bại" });
    }
  },

  triggerAutoSave: () => {
    set({ isDirty: true });
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => get().saveChanges(), 2000);
  },

  // ... Các hàm exportPdf, updateCvField, addItem... giữ nguyên như code bạn đã cung cấp
  exportPdf: async () => {
    const { currentCvId, isDirty, isSaving } = get();
    if (!currentCvId) return;

    if (isDirty || isSaving) {
      if (saveTimeout) clearTimeout(saveTimeout);
      await get().saveChanges();
    }

    set({ isSaving: true, error: null });
    try {
      const response = await cvService.exportPdf(currentCvId);
      const blob =
        response instanceof Blob
          ? response
          : new Blob([response as any], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = cleanPlainText(
        get().data.personalInfo?.fullName || "User",
      ).replace(/\s+/g, "_");
      link.download = `CV_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      set({ isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: "Lỗi xuất PDF." });
    }
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
                    description: "",
                    date: "",
                  },
                ],
              }
            : s,
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
                items: (s.items || []).map((i: any) =>
                  i.id === itemId ? { ...i, [field]: value || "" } : i,
                ),
              }
            : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },

  setTemplateId: (id: string) => {
    set((state) => ({
      data: { ...state.data, theme: { ...state.data.theme, templateId: id } },
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

  removeItem: (sectionId, itemId) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: (s.items || []).filter((i: any) => i.id !== itemId),
              }
            : s,
        ),
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

  moveSection: (sectionId, sourceCol, destCol, index) => {
    set((state) => {
      const newLayout = { ...state.data.layout } as any;
      const sourceList = Array.from(newLayout[sourceCol] || []);
      const destList =
        sourceCol === destCol
          ? sourceList
          : Array.from(newLayout[destCol] || []);
      const sourceIndex = sourceList.indexOf(sectionId);
      if (sourceIndex === -1) return state;
      sourceList.splice(sourceIndex, 1);
      destList.splice(index, 0, sectionId);
      newLayout[sourceCol] = sourceList;
      newLayout[destCol] = destList;
      return { data: { ...state.data, layout: newLayout } };
    });
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
}));
