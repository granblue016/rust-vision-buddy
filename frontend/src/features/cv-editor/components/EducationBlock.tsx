import React from "react";
import { CvSection, CvItem } from "@/types/cv";
import { GraduationCap, Calendar, PlusCircle, Trash2 } from "lucide-react";
import InlineRichText from "./InlineRichText";
import { useCvStore } from "@/stores/useCvStore";

interface EducationBlockProps {
  section: CvSection;
}

export const EducationBlock: React.FC<EducationBlockProps> = ({ section }) => {
  const { addItem, updateItemField, removeItem } = useCvStore();

  // Guard clause: Nếu section bị ẩn hoặc không tồn tại
  if (!section || !section.visible) return null;

  return (
    <div className="space-y-6 py-4 group/section">
      {/* Danh sách các mục học vấn */}
      <div className="space-y-8">
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className="group/item relative pl-10 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-[-32px] before:w-[1.5px] before:bg-slate-100 last:before:hidden transition-all"
          >
            {/* Nút xóa Item - Hiện khi hover vào từng mục */}
            <button
              onClick={() => removeItem(section.id, item.id)}
              className="absolute -left-2 top-8 opacity-0 group-hover/item:opacity-100 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm transition-all z-20"
              title="Xóa mục này"
            >
              <Trash2 size={12} />
            </button>

            {/* Biểu tượng Mũ tốt nghiệp */}
            <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm z-10 group-hover/item:border-blue-400 group-hover/item:bg-blue-50 transition-colors">
              <GraduationCap
                size={12}
                className="text-slate-500 group-hover/item:text-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Dòng 1: Ngành học & Thời gian */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <InlineRichText
                    value={item.title || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "title", val)
                    }
                    className="font-bold text-[15px] text-slate-800 leading-tight block w-full"
                    placeholder="Tên ngành học / Khóa đào tạo..."
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono shrink-0 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-transparent group-hover/item:border-slate-100 transition-all">
                  <Calendar size={10} />
                  <InlineRichText
                    value={item.date || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "date", val)
                    }
                    className="w-28 text-right bg-transparent uppercase tracking-tighter"
                    placeholder="MM/YYYY - HIỆN TẠI"
                  />
                </div>
              </div>

              {/* Dòng 2: Tên trường học */}
              <div className="-mt-0.5">
                <InlineRichText
                  value={item.subtitle || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "subtitle", val)
                  }
                  className="text-[13px] text-blue-600 font-bold tracking-wide block w-full"
                  placeholder="Tên trường đại học / Trung tâm đào tạo..."
                />
              </div>

              {/* Dòng 3: GPA hoặc Thành tựu */}
              <div className="mt-1 opacity-80 group-hover/item:opacity-100 transition-opacity">
                <InlineRichText
                  value={item.description || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "description", val)
                  }
                  className="text-[12px] text-slate-500 leading-relaxed italic block w-full min-h-[1.5em]"
                  placeholder="GPA: 3.8/4.0 • Học bổng xuất sắc • Các môn học tiêu biểu..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm mục mới */}
      <button
        onClick={() => addItem(section.id)}
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-slate-200 hover:border-blue-200 transition-all ml-10 uppercase tracking-wider"
      >
        <PlusCircle size={14} />
        Thêm học vấn mới
      </button>
    </div>
  );
};

export default EducationBlock;
