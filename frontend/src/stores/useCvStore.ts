import { create } from "zustand";
import { CvLayoutData, CvSection, CvSectionItem, CvTheme } from "@/types/cv";

// Định nghĩa trạng thái của Store
interface CvStoreState {
  data: CvLayoutData;
  isSaving: boolean;
  lastSaved: Date | null;

  // Hành động với toàn bộ dữ liệu
  setInitialData: (data: CvLayoutData) => void;
  setTemplateId: (id: string) => void;
  updateTheme: (theme: Partial<CvTheme>) => void;

  // Hành động với Section
  reorderSections: (startIndex: number, endIndex: number) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;

  // Hành động với Item
  updateItemField: (
    sectionId: string,
    itemId: string,
    field: keyof CvSectionItem,
    value: string,
  ) => void;
  addItem: (sectionId: string, type: CvSection["type"]) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  reorderItems: (
    sectionId: string,
    startIndex: number,
    endIndex: number,
  ) => void;

  // Trạng thái hệ thống
  setIsSaving: (v: boolean) => void;
  markSaved: () => void;
}

const DEFAULT_THEME: CvTheme = {
  font_family: "Inter",
  font_size: "14px",
  line_height: 1.5,
  primary_color: "#2563eb",
};

const DEFAULT_DATA: CvLayoutData = {
  template_id: "modern-01",
  theme: DEFAULT_THEME,
  sections: [
    {
      id: "personal_info",
      type: "personal_info",
      title: "Thông tin cá nhân",
      visible: true,
      items: [
        {
          id: "pi-1",
          title: "HỌ VÀ TÊN",
          subtitle: "Vị trí ứng tuyển",
          description: "email@example.com",
          date: "0912 345 678",
        },
      ],
    },
    {
      id: "experience",
      type: "experience",
      title: "Kinh nghiệm làm việc",
      visible: true,
      items: [],
    },
    {
      id: "education",
      type: "education",
      title: "Học vấn",
      visible: true,
      items: [],
    },
    {
      id: "skills",
      type: "skills",
      title: "Kỹ năng",
      visible: true,
      items: [],
    },
  ],
};

// Hàm helper tạo ID ngẫu nhiên an toàn hơn crypto.randomUUID() trong một số môi trường dev
const generateId = () => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};

export const useCvStore = create<CvStoreState>((set) => ({
  data: DEFAULT_DATA,
  isSaving: false,
  lastSaved: null,

  setInitialData: (data) => set({ data }),

  setTemplateId: (id) =>
    set((state) => ({
      data: { ...state.data, template_id: id },
    })),

  updateTheme: (themeUpdate) =>
    set((state) => ({
      data: {
        ...state.data,
        theme: { ...state.data.theme, ...themeUpdate },
      },
    })),

  reorderSections: (startIndex, endIndex) =>
    set((state) => {
      const sections = [...state.data.sections];
      const [removed] = sections.splice(startIndex, 1);
      sections.splice(endIndex, 0, removed);
      return { data: { ...state.data, sections } };
    }),

  toggleSectionVisibility: (sectionId) =>
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s,
        ),
      },
    })),

  updateSectionTitle: (sectionId, title) =>
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === sectionId ? { ...s, title } : s,
        ),
      },
    })),

  updateItemField: (sectionId, itemId, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item,
            ),
          };
        }),
      },
    })),

  addItem: (sectionId, type) =>
    set((state) => {
      // Khởi tạo item với ID duy nhất
      const id = generateId();

      let newItem: CvSectionItem = {
        id,
        title: "Tiêu đề mới",
        subtitle: "",
        date: "",
        description: "",
      };

      // Đổ dữ liệu mẫu (Boilerplate) tùy theo loại section
      switch (type) {
        case "experience":
          newItem = {
            ...newItem,
            title: "Vị trí công việc",
            subtitle: "Tên công ty / Tổ chức",
            date: "Tháng/Năm - Hiện tại",
            description: "Mô tả chi tiết nhiệm vụ và thành quả...",
          };
          break;
        case "education":
          newItem = {
            ...newItem,
            title: "Ngành học / Khóa học",
            subtitle: "Tên trường / Trung tâm",
            date: "2020 - 2024",
            description: "GPA: 3.5/4.0 hoặc các chứng chỉ liên quan...",
          };
          break;
        case "skills":
          newItem = {
            ...newItem,
            title: "Tên kỹ năng",
            description: "Mô tả công cụ hoặc mức độ thành thạo...",
          };
          break;
      }

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

  reorderItems: (sectionId, startIndex, endIndex) =>
    set((state) => {
      const updatedSections = state.data.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const newItems = [...section.items];
        const [removed] = newItems.splice(startIndex, 1);
        newItems.splice(endIndex, 0, removed);
        return { ...section, items: newItems };
      });
      return { data: { ...state.data, sections: updatedSections } };
    }),

  setIsSaving: (v) => set({ isSaving: v }),
  markSaved: () => set({ isSaving: false, lastSaved: new Date() }),
}));
