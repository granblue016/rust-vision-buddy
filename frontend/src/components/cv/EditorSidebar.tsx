import React from "react";
// Sửa đường dẫn: Lùi 2 cấp để vào đúng thư mục src/stores, src/lib, src/types
import { useCvStore } from "../../stores/useCvStore";
import {
  Plus,
  Palette,
  Layout,
  Eye,
  EyeOff,
  Type,
  Save,
  CheckCircle2,
  LucideIcon,
  Columns,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { CvSection } from "../../types/cv";

interface SectionTypeOption {
  type: CvSection["type"];
  label: string;
  icon: LucideIcon;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  previewClass: string;
}

const EditorSidebar = () => {
  const {
    data,
    updateTheme,
    addItem,
    toggleSectionVisibility,
    isSaving,
    lastSaved,
  } = useCvStore();

  if (!data) return null;

  const sectionTypes: SectionTypeOption[] = [
    { type: "experience", label: "Kinh nghiệm", icon: Layout },
    { type: "education", label: "Học vấn", icon: Type },
    { type: "projects", label: "Dự án", icon: Layout },
    { type: "skills", label: "Kỹ năng", icon: Palette },
  ];

  const themeColors = [
    "#2563eb",
    "#1e293b",
    "#059669",
    "#dc2626",
    "#7c3aed",
    "#ea580c",
  ];

  const templates: TemplateOption[] = [
    {
      id: "modern-01",
      name: "Modern Blue",
      description: "2 cột, hiện đại",
      previewClass: "bg-slate-100 border-l-8 border-l-blue-500",
    },
    {
      id: "harvard-01",
      name: "Harvard Classic",
      description: "1 cột, chuẩn ATS",
      previewClass: "bg-white border-t-4 border-t-slate-900 shadow-inner",
    },
    {
      id: "harvard-02",
      name: "Harvard Divider",
      description: "Có đường kẻ dọc",
      previewClass: "bg-white border-l-2 border-l-slate-400",
    },
  ];

  return (
    <aside className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-sm overflow-hidden">
      {/* 1. Header Status */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-800">Thiết kế CV</h2>
          {isSaving ? (
            <div className="flex items-center gap-1.5 text-indigo-600 animate-pulse">
              <Save size={14} />
              <span className="text-[10px] font-bold uppercase">Đang lưu</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-bold uppercase">Đã lưu</span>
            </div>
          )}
        </div>
        {lastSaved && (
          <p className="text-[10px] text-slate-400">
            Cập nhật: {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* TEMPLATES SELECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-900">
            <Columns size={18} className="text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Chọn mẫu CV
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => updateTheme({ templateId: tpl.id })}
                className={cn(
                  "relative flex flex-col gap-2 p-2 rounded-lg border-2 transition-all group",
                  data.theme.templateId === tpl.id
                    ? "border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-100"
                    : "border-slate-100 hover:border-slate-200",
                )}
              >
                <div
                  className={cn(
                    "w-full h-20 rounded border border-slate-200 flex items-center justify-center overflow-hidden",
                    tpl.previewClass,
                  )}
                >
                  <div className="scale-75 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Layout size={32} />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-700 truncate">
                    {tpl.name}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">
                    {tpl.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* PRIMARY COLOR */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-900">
            <Palette size={18} className="text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Màu chủ đạo
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {themeColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateTheme({ primaryColor: color })}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm",
                  data.theme.primaryColor === color
                    ? "border-indigo-500 ring-4 ring-indigo-50"
                    : "border-transparent",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>

        {/* ADD CONTENT SECTIONS */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-900">
            <Plus size={18} className="text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Thêm nội dung
            </h3>
          </div>
          <div className="grid gap-2">
            {sectionTypes.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  // Xác định rõ kiểu s: CvSection để tránh lỗi implicit any
                  const targetSection = data.sections.find(
                    (s: CvSection) => s.type === item.type,
                  );
                  // Chỉ truyền 1 đối số targetSection.id theo Store logic
                  if (targetSection) addItem(targetSection.id);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
              >
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white">
                  <item.icon
                    size={16}
                    className="text-slate-600 group-hover:text-indigo-600"
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Thêm {item.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* STRUCTURE MANAGEMENT */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-900">
            <Layout size={18} className="text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Cấu trúc CV
            </h3>
          </div>
          <div className="space-y-1">
            {data.sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    section.visible
                      ? "text-slate-700"
                      : "text-slate-400 italic line-through",
                  )}
                >
                  {section.title}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSectionVisibility(section.id)}
                  className={cn(
                    "p-1.5 rounded-md",
                    section.visible
                      ? "text-slate-400 hover:bg-slate-200"
                      : "text-amber-500 bg-amber-50",
                  )}
                >
                  {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Tip */}
      <div className="p-4 bg-slate-900 text-white">
        <p className="text-[10px] font-medium opacity-60 uppercase mb-1">
          Mẹo chuyên gia
        </p>
        <p className="text-[11px] leading-relaxed text-slate-300">
          Dùng mẫu <b>Harvard</b> để tối ưu hóa khả năng quét của hệ thống ATS.
        </p>
      </div>
    </aside>
  );
};

export default EditorSidebar;
