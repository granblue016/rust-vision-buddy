import React from "react";
import { useCvStore } from "@/stores/useCvStore"; // Đã sửa thành stores
import {
  Plus,
  Palette,
  Layout,
  Eye,
  EyeOff,
  Type,
  Save,
  CheckCircle2,
  LucideIcon, // Thêm Type cho Icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CvSection } from "@/types/cv";

// Định nghĩa Interface để xóa bỏ lỗi 'any'
interface SectionTypeOption {
  type: CvSection["type"];
  label: string;
  icon: LucideIcon;
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

  // Kiểm tra an toàn để tránh lỗi render khi data chưa load
  if (!data) return null;

  // Định nghĩa các loại mục với Type-safe
  const sectionTypes: SectionTypeOption[] = [
    { type: "experience", label: "Kinh nghiệm", icon: Layout },
    { type: "education", label: "Học vấn", icon: Type },
    { type: "skills", label: "Kỹ năng", icon: Palette },
  ];

  // Danh sách các màu chủ đạo
  const themeColors = [
    "#2563eb", // Blue
    "#1e293b", // Slate
    "#059669", // Emerald
    "#dc2626", // Red
    "#7c3aed", // Violet
    "#ea580c", // Orange
  ];

  return (
    <aside className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-sm overflow-hidden">
      {/* 1. Header: Trạng thái lưu trữ */}
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
            Cập nhật lần cuối: {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* 2. Tùy chỉnh màu sắc (Theme) */}
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
                onClick={() => updateTheme({ primary_color: color })}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-sm",
                  data.theme.primary_color === color
                    ? "border-indigo-500 ring-2 ring-indigo-100 scale-110"
                    : "border-transparent",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>

        {/* 3. Thêm Section mới vào CV */}
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
                onClick={() => {
                  const targetSection = data.sections.find(
                    (s) => s.type === item.type,
                  );
                  if (targetSection) {
                    addItem(targetSection.id, item.type);
                  }
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group text-left"
              >
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
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

        {/* 4. Quản lý danh sách Section */}
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
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    section.visible
                      ? "text-slate-700"
                      : "text-slate-400 italic line-through",
                  )}
                >
                  {section.title}
                </span>
                <button
                  onClick={() => toggleSectionVisibility(section.id)}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    section.visible
                      ? "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                      : "text-amber-500 bg-amber-50 shadow-sm",
                  )}
                >
                  {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 bg-indigo-600 text-white">
        <p className="text-[10px] font-medium opacity-80 uppercase mb-1">
          Mẹo nhỏ
        </p>
        <p className="text-[11px] leading-relaxed">
          Kéo thả trực tiếp trên bản xem trước để sắp xếp lại thứ tự.
        </p>
      </div>
    </aside>
  );
};

export default EditorSidebar;
