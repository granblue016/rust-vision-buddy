import React from "react";
import { CvSection } from "../../../types/cv";
import { useCvStore } from "../../../stores/useCvStore";
import { GraduationCap, Calendar } from "lucide-react";

interface EducationBlockProps {
  section: CvSection;
}

export const EducationBlock: React.FC<EducationBlockProps> = ({ section }) => {
  // Lấy hàm update từ store
  const updateItemField = useCvStore((state) => state.updateItemField);

  if (!section.visible) return null;

  return (
    <div className="space-y-6 py-2">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="group relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-3 before:bottom-[-24px] before:w-[1px] before:bg-slate-200 last:before:hidden"
        >
          {/* Icon Mũ tốt nghiệp */}
          <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-300 shadow-sm z-10">
            <GraduationCap size={12} className="text-slate-500" />
          </div>

          <div className="flex flex-col gap-1">
            {/* Tên Ngành học / Khóa học */}
            <div className="flex justify-between items-start gap-4">
              <input
                className="w-full font-bold text-[15px] text-slate-800 bg-transparent border-none focus:ring-0 p-0 outline-none placeholder:text-slate-300"
                value={item.title || ""}
                onChange={(e) =>
                  updateItemField(section.id, item.id, "title", e.target.value)
                }
                placeholder="Ngành học (ví dụ: Công nghệ thông tin)"
              />

              <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-medium shrink-0 pt-0.5">
                <Calendar size={12} />
                <input
                  className="bg-transparent border-none focus:ring-0 p-0 w-24 text-right outline-none placeholder:text-slate-200"
                  value={item.date || ""}
                  onChange={(e) =>
                    updateItemField(section.id, item.id, "date", e.target.value)
                  }
                  placeholder="2018 - 2022"
                />
              </div>
            </div>

            {/* Tên Trường học */}
            <input
              className="w-full text-[13px] text-blue-600 font-semibold bg-transparent border-none focus:ring-0 p-0 outline-none placeholder:text-blue-200"
              value={item.subtitle || ""}
              onChange={(e) =>
                updateItemField(section.id, item.id, "subtitle", e.target.value)
              }
              placeholder="Trường Đại học (ví dụ: ĐH Bách Khoa)"
            />

            {/* GPA hoặc Mô tả ngắn (Nếu cần) */}
            {item.description !== undefined && (
              <input
                className="w-full text-[12px] text-slate-500 bg-transparent border-none focus:ring-0 p-0 outline-none italic mt-1"
                value={item.description || ""}
                onChange={(e) =>
                  updateItemField(
                    section.id,
                    item.id,
                    "description",
                    e.target.value,
                  )
                }
                placeholder="GPA: 3.6/4.0 hoặc Giải thưởng..."
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
