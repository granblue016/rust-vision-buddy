import React from "react";
// 1. Đồng bộ Type: Sử dụng CvSection và CvItem từ types/cv.ts
import { CvSection, CvItem } from "../../../types/cv";
import { FolderGit2, Link as LinkIcon, PlusCircle, Trash2 } from "lucide-react";
import { InlineRichText } from "./InlineRichText";
import { useCvStore } from "../../../stores/useCvStore";

interface ProjectsBlockProps {
  section: CvSection;
  primaryColor?: string;
  templateId?: string;
}

export const ProjectsBlock: React.FC<ProjectsBlockProps> = ({
  section,
  primaryColor = "#6366f1",
  templateId = "standard",
}) => {
  const { addItem, updateItemField, removeItem } = useCvStore();

  if (!section || !section.visible) return null;

  // Kiểm tra mẫu thiết kế
  const isHarvard = templateId.toLowerCase().includes("harvard");

  return (
    <div
      className={`py-2 group/section ${isHarvard ? "font-serif" : "font-sans"}`}
    >
      <div className={isHarvard ? "space-y-4" : "space-y-6"}>
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className={`group/item relative transition-all ${
              isHarvard
                ? "pl-0"
                : "pl-10 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-[-24px] before:w-[1.5px] before:bg-slate-100 last:before:hidden"
            }`}
          >
            {/* Nút xóa dự án - Ẩn khi in */}
            <button
              type="button"
              onClick={() => removeItem(section.id, item.id)}
              className="absolute -left-8 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm transition-all z-20 print:hidden"
              title="Xóa dự án"
            >
              <Trash2 size={12} />
            </button>

            {/* Icon dự án - Chỉ hiện ở Modern/Standard */}
            {!isHarvard && (
              <div
                className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm z-10"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <FolderGit2 size={11} style={{ color: primaryColor }} />
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              {/* DÒNG 1: Tên dự án & Link/Công nghệ */}
              <div className="flex justify-between items-baseline gap-4">
                <div className="flex-1">
                  <InlineRichText
                    value={item.title || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "title", val)
                    }
                    className={`block w-full outline-none leading-tight ${
                      isHarvard
                        ? "text-[15px] font-bold text-slate-900"
                        : "text-[14px] font-bold uppercase tracking-wide text-slate-800"
                    }`}
                    style={!isHarvard ? { color: primaryColor } : {}}
                    placeholder="Tên dự án (Ví dụ: AI CV Scanner)"
                  />
                </div>

                <div
                  className={`flex items-center gap-1.5 shrink-0 transition-all ${
                    isHarvard
                      ? "text-[14px] text-slate-800 font-bold"
                      : "text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
                  }`}
                >
                  {!isHarvard && (
                    <LinkIcon size={10} style={{ color: primaryColor }} />
                  )}
                  <InlineRichText
                    value={item.subtitle || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "subtitle", val)
                    }
                    className={`text-right bg-transparent outline-none ${
                      isHarvard ? "w-48 italic font-normal" : "w-32 italic"
                    }`}
                    placeholder={isHarvard ? "github.com/link" : "Link/Tech"}
                  />
                </div>
              </div>

              {/* DÒNG 2: Mô tả dự án */}
              <div
                className={`mt-1.5 ${isHarvard ? "" : "opacity-95 group-hover/item:opacity-100"}`}
              >
                <InlineRichText
                  value={item.description || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "description", val)
                  }
                  className={`block w-full min-h-[1.5em] outline-none text-slate-700 leading-relaxed ${
                    isHarvard ? "text-[13px]" : "text-[13px]"
                  }`}
                  placeholder="Mô tả công nghệ sử dụng (Rust, React...) và thành tựu chính của dự án..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NÚT THÊM DỰ ÁN - Ẩn khi in */}
      <button
        type="button"
        onClick={() => addItem(section.id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed transition-all mt-4 uppercase tracking-wider hover:bg-slate-50 print:hidden ${
          isHarvard ? "ml-0 text-[10px]" : "ml-10 text-[11px]"
        } font-bold text-slate-400 border-slate-200`}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = primaryColor;
          e.currentTarget.style.borderColor = primaryColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#94a3b8";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }}
      >
        <PlusCircle size={14} />
        Thêm dự án mới
      </button>
    </div>
  );
};

export default ProjectsBlock;
