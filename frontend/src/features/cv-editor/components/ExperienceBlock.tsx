import React from "react";
import { CvSection, CvItem } from "@/types/cv";
import { Briefcase, Calendar, PlusCircle, Trash2 } from "lucide-react";
import InlineRichText from "./InlineRichText";
import { useCvStore } from "@/stores/useCvStore";

interface ExperienceBlockProps {
  section: CvSection;
}

export const ExperienceBlock: React.FC<ExperienceBlockProps> = ({
  section,
}) => {
  const { addItem, updateItemField, removeItem } = useCvStore();

  // Guard clause: Nếu section bị ẩn hoặc không tồn tại
  if (!section || !section.visible) return null;

  return (
    <div className="py-4 group/section">
      <div className="space-y-10">
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className="group/item relative pl-10 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-[-40px] before:w-[1.5px] before:bg-slate-100 last:before:hidden transition-all"
          >
            {/* Nút xóa Item - Hiện khi hover vào từng mục */}
            <button
              onClick={() => removeItem(section.id, item.id)}
              className="absolute -left-2 top-8 opacity-0 group-hover/item:opacity-100 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm transition-all z-20"
              title="Xóa mục này"
            >
              <Trash2 size={12} />
            </button>

            {/* Timeline Icon - Briefcase */}
            <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm z-10 group-hover/item:border-indigo-400 group-hover/item:bg-indigo-50 transition-colors">
              <Briefcase
                size={11}
                className="text-slate-500 group-hover/item:text-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Dòng 1: Vị trí công việc & Thời gian làm việc */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <InlineRichText
                    value={item.title || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "title", val)
                    }
                    className="text-[16px] font-bold text-slate-800 leading-tight block w-full"
                    placeholder="Vị trí (ví dụ: Senior Frontend Developer)"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono shrink-0 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-transparent group-hover/item:border-slate-100 transition-all">
                  <Calendar size={10} />
                  <InlineRichText
                    value={item.date || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "date", val)
                    }
                    className="w-32 text-right bg-transparent uppercase tracking-tighter"
                    placeholder="01/2022 - HIỆN TẠI"
                  />
                </div>
              </div>

              {/* Dòng 2: Tên công ty / Tổ chức */}
              <div className="-mt-1">
                <InlineRichText
                  value={item.subtitle || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "subtitle", val)
                  }
                  className="text-[14px] font-bold text-indigo-600 block w-full"
                  placeholder="Tên công ty (ví dụ: Google, Inc.)"
                />
              </div>

              {/* Dòng 3: Mô tả chi tiết (Nhiệm vụ & Thành tựu) */}
              <div className="mt-2 opacity-90 group-hover/item:opacity-100 transition-opacity">
                <InlineRichText
                  value={item.description || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "description", val)
                  }
                  className="text-[13px] text-slate-600 leading-relaxed text-justify block w-full min-h-[3em]"
                  placeholder="• Phát triển tính năng X giúp tăng 20% hiệu suất...&#10;• Quản lý đội ngũ 5 thành viên..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm kinh nghiệm mới */}
      <button
        onClick={() => addItem(section.id)}
        className="flex items-center gap-2 px-3 py-2 text-[11px] font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-dashed border-slate-200 hover:border-indigo-200 transition-all ml-10 mt-6 uppercase tracking-[0.1em]"
      >
        <PlusCircle size={14} />
        Thêm kinh nghiệm làm việc
      </button>
    </div>
  );
};

export default ExperienceBlock;
