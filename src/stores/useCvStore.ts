import { create } from "zustand";

export interface CvThemeData {
  primary_color: string;
  font_family: string;
}

export interface CvSectionData {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  items: Record<string, unknown>[];
}

export interface CvLayoutState {
  template_id: string;
  theme: CvThemeData;
  sections: CvSectionData[];
}

interface CvStoreState {
  data: CvLayoutState;
  isSaving: boolean;
  lastSaved: Date | null;
  setInitialData: (data: CvLayoutState) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  toggleSectionVisibility: (id: string) => void;
  updateTheme: (color: string) => void;
  setTemplateId: (id: string) => void;
  setIsSaving: (v: boolean) => void;
  markSaved: () => void;
}

const DEFAULT_DATA: CvLayoutState = {
  template_id: "modern-01",
  theme: {
    primary_color: "#0f172a",
    font_family: "Roboto",
  },
  sections: [
    { id: "header", type: "header", title: "Thông tin cá nhân", visible: true, items: [] },
    { id: "summary", type: "summary", title: "Mục tiêu nghề nghiệp", visible: true, items: [] },
    { id: "education", type: "education", title: "Học vấn", visible: true, items: [] },
    { id: "experience", type: "experience", title: "Kinh nghiệm làm việc", visible: true, items: [] },
    { id: "skills", type: "skills", title: "Kỹ năng", visible: true, items: [] },
  ],
};

export const useCvStore = create<CvStoreState>((set) => ({
  data: DEFAULT_DATA,
  isSaving: false,
  lastSaved: null,
  setInitialData: (data) => set({ data }),
  reorderSections: (startIndex, endIndex) =>
    set((state) => {
      const sections = [...state.data.sections];
      const [removed] = sections.splice(startIndex, 1);
      sections.splice(endIndex, 0, removed);
      return { data: { ...state.data, sections } };
    }),
  toggleSectionVisibility: (id) =>
    set((state) => ({
      data: {
        ...state.data,
        sections: state.data.sections.map((s) =>
          s.id === id ? { ...s, visible: !s.visible } : s
        ),
      },
    })),
  updateTheme: (color) =>
    set((state) => ({
      data: { ...state.data, theme: { ...state.data.theme, primary_color: color } },
    })),
  setTemplateId: (id) =>
    set((state) => ({ data: { ...state.data, template_id: id } })),
  setIsSaving: (v) => set({ isSaving: v }),
  markSaved: () => set({ isSaving: false, lastSaved: new Date() }),
}));
