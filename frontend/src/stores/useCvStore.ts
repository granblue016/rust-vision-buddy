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

let saveTimeout: any;

/**
 * 1. Làm sạch Text thuần (Tên, Chức danh, Tiêu đề mục...):
 * Xóa toàn bộ HTML để tránh lỗi dính thẻ <p> vào tên hoặc tiêu đề.
 */
const cleanPlainText = (html: string | undefined | null): string => {
  if (!html) return "";
  return html
    .replace(/<\/?[^>]+(>|$)/g, "") // Xóa sạch mọi thẻ HTML
    .replace(/&nbsp;/g, " ") // Xử lý khoảng trắng an toàn
    .trim();
};

/**
 * 2. CHẶN LỖI 422 TỪ RUST:
 * Rust cực kỳ khắt khe. Nếu gửi lên `undefined` hoặc `null`, API sẽ crash.
 * Hàm này "ép" mọi dữ liệu về đúng định dạng Schema mà Rust mong đợi.
 */
const cleanDataForStorage = (data: CvLayoutData): CvLayoutData => {
  return {
    ...data,
    personalInfo: {
      ...data.personalInfo,
      // Ép kiểu các trường thông tin cá nhân về text thuần (không HTML, không Null)
      fullName: cleanPlainText(data.personalInfo?.fullName),
      title: cleanPlainText(data.personalInfo?.title),
      email: cleanPlainText(data.personalInfo?.email),
      phone: cleanPlainText(data.personalInfo?.phone),
      address: cleanPlainText(data.personalInfo?.address),
      link: cleanPlainText(data.personalInfo?.link),
      avatar: data.personalInfo?.avatar || "",
    },
    theme: {
      ...data.theme,
      primaryColor: data.theme?.primaryColor || "#4f46e5",
      fontFamily: data.theme?.fontFamily || "Inter",
      fontSize: data.theme?.fontSize || "Vừa",
      templateId: data.theme?.templateId || "MODERN-01",
    },
    layout: data.layout || {
      "column-1": [],
      "column-2": [],
      "column-3": [],
    },
    sections: (data.sections || []).map((s) => ({
      ...s,
      id: s.id || crypto.randomUUID(),
      type: s.type || "custom",
      title: cleanPlainText(s.title),
      visible: s.visible ?? true,
      // KHÔNG strip HTML của content vì Text Editor (Rich Text) cần giữ format
      content: s.content || "",
      items: (s.items || []).map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        title: cleanPlainText(item.title),
        subtitle: cleanPlainText(item.subtitle),
        date: cleanPlainText(item.date),
        // Tương tự, giữ nguyên HTML cho description
        description: item.description || "",
      })),
    })),
  };
};

export const useCvStore = create<CvStoreState>((set, get) => ({
  // --- 1. STATE ---
  currentCvId: null,
  data: DEFAULT_CV_DATA,
  isSaving: false,
  isLoading: false,
  isDirty: false,
  error: null,
  lastSaved: null,

  // --- 2. HỆ THỐNG ĐỒNG BỘ ---
  setIsSaving: (isSaving: boolean) => set({ isSaving }),

  setInitialData: (data: CvLayoutData) =>
    set({ data: cleanDataForStorage(data), isDirty: false, isLoading: false }),

  fetchCv: async (id: string) => {
    if (!id) return;
    set({ isLoading: true, error: null, currentCvId: id });
    try {
      const cv = await cvService.getById(id);
      const incoming = cv.layout_data || {};

      const mergedData: CvLayoutData = {
        ...DEFAULT_CV_DATA,
        ...incoming,
        personalInfo: {
          ...DEFAULT_CV_DATA.personalInfo,
          ...(incoming.personalInfo || {}),
        },
        theme: { ...DEFAULT_CV_DATA.theme, ...(incoming.theme || {}) },
        layout: { ...DEFAULT_CV_DATA.layout, ...(incoming.layout || {}) },
        sections:
          Array.isArray(incoming.sections) && incoming.sections.length > 0
            ? incoming.sections
            : DEFAULT_CV_DATA.sections,
      };

      // Load lên cũng phải đảm bảo sạch sẽ
      set({
        data: cleanDataForStorage(mergedData),
        isLoading: false,
        isDirty: false,
      });
    } catch (err: any) {
      console.error("Fetch CV Error:", err);
      set({ error: "Lỗi tải dữ liệu", isLoading: false });
    }
  },

  saveChanges: async () => {
    const { currentCvId, data, isDirty, isSaving } = get();
    if (!currentCvId || !isDirty || isSaving) return;

    set({ isSaving: true });
    try {
      // Ép dữ liệu phải đạt chuẩn trước khi truyền sang API Rust
      const cleanedData = cleanDataForStorage(data);

      await cvService.update(currentCvId, { layout_data: cleanedData });

      set({
        isSaving: false,
        isDirty: false,
        lastSaved: new Date(),
        data: cleanedData, // Cập nhật UI với dữ liệu đã chuẩn hóa
      });
    } catch (err: any) {
      console.error("Save Changes Error:", err);
      set({ isSaving: false, error: "Lưu thất bại" });
    }
  },

  triggerAutoSave: () => {
    set({ isDirty: true });
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => get().saveChanges(), 2000); // Đợi 2s sau khi ngừng gõ mới lưu
  },

  exportPdf: async () => {
    const { currentCvId, isDirty, isSaving } = get();
    if (!currentCvId) return;

    // Chờ lưu xong dữ liệu hiện tại mới được gọi lệnh In (tránh in ra data cũ)
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

      // Tạo tên file an toàn
      const safeName = get().data.personalInfo?.fullName
        ? cleanPlainText(get().data.personalInfo.fullName).replace(/\s+/g, "_")
        : "User";

      link.download = `CV_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      set({ isSaving: false });
    } catch (err) {
      console.error("Export PDF Error:", err);
      set({
        isSaving: false,
        error: "Lỗi xuất PDF. Máy chủ Rust có thể bị Timeout.",
      });
    }
  },

  // --- 3. ACTIONS ĐỂ GIẢI QUYẾT LỖI TS(2739) & QUẢN LÝ DỮ LIỆU ---
  setTemplateId: (id: string) => {
    set((state) => ({
      data: { ...state.data, theme: { ...state.data.theme, templateId: id } },
    }));
    get().triggerAutoSave();
  },

  moveSection: (sectionId, sourceCol, destCol, index) => {
    set((state) => {
      const newLayout = { ...state.data.layout };
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

  updateTheme: (newTheme) => {
    set((state) => ({
      data: { ...state.data, theme: { ...state.data.theme, ...newTheme } },
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

  updateItemField: (sectionId, itemId, field, value) => {
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: (s.items || []).map((i: any) =>
                  i.id === itemId ? { ...i, [field]: value } : i,
                ),
              }
            : s,
        ),
      },
    }));
    get().triggerAutoSave();
  },
}));
