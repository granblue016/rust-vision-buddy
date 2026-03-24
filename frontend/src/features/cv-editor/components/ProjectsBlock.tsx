import React from "react";
import { CvSection, CvItem } from "@/types/cv";
import { FolderGit2, Link as LinkIcon, PlusCircle, Trash2 } from "lucide-react";
import InlineRichText from "./InlineRichText";
import { useCvStore } from "@/stores/useCvStore";

interface ProjectsBlockProps {
  section: CvSection;
}

export const ProjectsBlock: React.FC<ProjectsBlockProps> = ({ section }) => {
  const { addItem, updateItemField, removeItem } = useCvStore();

  // Guard clause: Nếu section bị ẩn hoặc không tồn tại
  if (!section || !section.visible) return null;

  return (
    <div className="space-y-6 py-2 group/section">
      {/* Danh sách các dự án */}
      <div className="space-y-8">
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className="group/item relative pl-10 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-[-36px] before:w-[1.5px] before:bg-slate-100 last:before:hidden transition-all"
          >
            {/* Nút xóa dự án - Hiện khi hover */}
            <button
              onClick={() => removeItem(section.id, item.id)}
              className="absolute -left-2 top-8 opacity-0 group-hover/item:opacity-100 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm transition-all z-20"
              title="Xóa dự án"
            >
              <Trash2 size={12} />
            </button>

            {/* Biểu tượng dự án */}
            <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm z-10 group-hover/item:border-indigo-400 group-hover/item:bg-indigo-50 transition-colors">
              <FolderGit2
                size={11}
                className="text-slate-500 group-hover/item:text-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Dòng 1: Tên dự án & Link dự án */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <InlineRichText
                    value={item.title || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "title", val)
                    }
                    className="font-bold text-[15px] text-indigo-600 uppercase tracking-wide leading-tight block w-full"
                    placeholder=""
                  />
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 shrink-0 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-transparent group-hover/item:border-slate-100 transition-all">
                  <LinkIcon size={10} />
                  <InlineRichText
                    value={item.subtitle || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "subtitle", val)
                    }
                    className="w-32 text-right text-[11px] italic text-slate-500 bg-transparent"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Dòng 2: Mô tả chi tiết dự án */}
              <div className="mt-1 opacity-90 group-hover/item:opacity-100 transition-opacity">
                <InlineRichText
                  value={item.description || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "description", val)
                  }
                  className="text-[13px] text-slate-600 leading-relaxed text-justify block w-full min-h-[1.5em]"
                  placeholder=""
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm dự án mới */}
      <button
        onClick={() => addItem(section.id)}
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-dashed border-slate-200 hover:border-indigo-200 transition-all ml-10 mt-4 uppercase tracking-wider"
      >
        <PlusCircle size={14} />
        Thêm dự án mới
      </button>
    </div>
  );
};

export default ProjectsBlock;
