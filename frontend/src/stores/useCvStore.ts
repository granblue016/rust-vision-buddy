import { create } from "zustand";
import {
  CvLayoutData,
  DEFAULT_CV_DATA,
  CvStoreState,
  LayoutColumnId,
  CvSectionType,
  CvItem,
} from "../types/cv";
import { cvService } from "../services/cvService";

const generateId = () => Math.random().toString(36).substring(2, 11);
let saveTimeout: NodeJS.Timeout;

export const useCvStore = create<CvStoreState>((set, get) => ({
  currentCvId: null,
  data: DEFAULT_CV_DATA,
  isSaving: false,
  isLoading: false,
  error: null,
  lastSaved: null,

  // --- HỆ THỐNG & TỰ ĐỘNG LƯU ---
  setIsSaving: (isSaving: boolean) => set({ isSaving }),

  setInitialData: (data: CvLayoutData) => set({ data, isLoading: false }),

  triggerAutoSave: () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      get().saveChanges();
    }, 2000); // Tăng lên 2s để tránh spam API khi gõ phím nhanh
  },

  fetchCv: async (id: string) => {
    set({ isLoading: true, error: null, currentCvId: id });
    try {
      const cv = await cvService.getById(id);

      // LOGIC MERGE QUAN TRỌNG: Đảm bảo hiển thị đúng theo cấu trúc cv.ts
      const incomingData = cv.layout_data || {};

      const mergedData: CvLayoutData = {
        ...DEFAULT_CV_DATA, // 1. Lấy khung mặc định làm gốc
        ...incomingData, // 2. Ghi đè bằng dữ liệu từ database
        theme: {
          ...DEFAULT_CV_DATA.theme,
          ...(incomingData.theme || {}),
        },
        layout: {
          ...DEFAULT_CV_DATA.layout,
          ...(incomingData.layout || {}),
        },
        // Nếu database có sections thì dùng, không thì dùng mặc định để tránh màn hình trắng
        sections: incomingData.sections?.length
          ? incomingData.sections
          : DEFAULT_CV_DATA.sections,
      };

      set({ data: mergedData, isLoading: false });
    } catch (err: any) {
      // Nếu lỗi (ví dụ 404), dùng dữ liệu mặc định để người dùng vẫn có thể tạo mới
      set({
        error: "Không thể tải dữ liệu CV. Đang hiển thị bản nháp mặc định.",
        data: DEFAULT_CV_DATA,
        isLoading: false,
      });
    }
  },

  saveChanges: async () => {
    const { currentCvId, data } = get();
    if (!currentCvId) return;
    set({ isSaving: true });
    try {
      await cvService.update(currentCvId, { layout_data: data });
      set({ isSaving: false, lastSaved: new Date() });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
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

  // --- QUẢN LÝ BỐ CỤC (DRAG & DROP) ---
  setTemplateId: (id) => {
    set((state) => ({
      data: {
        ...state.data,
        template_id: id,
        theme: { ...state.data.theme, template_id: id }, // Đồng bộ theme
      },
    }));
    get().triggerAutoSave();
  },

  updateTheme: (newTheme) => {
    set((state) => ({
      data: {
        ...state.data,
        theme: { ...state.data.theme, ...newTheme },
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
      const newLayout = { ...state.data.layout };
      // Xóa khỏi cột cũ
      newLayout[sourceCol] = (newLayout[sourceCol] || []).filter(
        (id) => id !== sectionId,
      );
      // Thêm vào cột mới tại vị trí chỉ định
      const updatedDestCol = [...(newLayout[destCol] || [])];
      updatedDestCol.splice(index, 0, sectionId);
      newLayout[destCol] = updatedDestCol;

      return { data: { ...state.data, layout: newLayout } };
    });
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

  // --- THÊM/XÓA MỤC CON (ITEMS) ---
  addItem: (sectionId, type) => {
    set((state) => {
      const newItem: CvItem = {
        id: `${type}-${generateId()}`,
        title: "Tiêu đề mới",
        subtitle: "",
        date: "",
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
