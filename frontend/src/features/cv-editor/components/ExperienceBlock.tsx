import React, { useRef, useLayoutEffect, useCallback } from "react";
import { CvSection, CvItem } from "../../../types/cv";
import { useCvStore } from "../../../stores/useCvStore";
import { Briefcase, Calendar } from "lucide-react";

interface ExperienceBlockProps {
  section: CvSection;
}

/**
 * Component hiển thị danh sách Kinh nghiệm làm việc
 * Sử dụng Named Export để đồng bộ với cấu trúc import trong CVPreview
 */
export const ExperienceBlock: React.FC<ExperienceBlockProps> = ({
  section,
}) => {
  const { updateItemField } = useCvStore();

  // Sử dụng Map để quản lý refs của textarea dựa trên ID item (tối ưu hơn dùng mảng index)
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  // Callback để gán ref cho từng textarea khi render
  const setRef = useCallback((id: string, el: HTMLTextAreaElement | null) => {
    if (el) {
      textareaRefs.current.set(id, el);
    } else {
      textareaRefs.current.delete(id);
    }
  }, []);

  // Tự động điều chỉnh chiều cao (Auto-resize) khi dữ liệu items thay đổi
  useLayoutEffect(() => {
    textareaRefs.current.forEach((textarea) => {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    });
  }, [section.items]);

  if (!section.visible) return null;

  return (
    <div className="py-2 group/section">
      <div className="space-y-8">
        {section.items.map((item: CvItem) => (
          <div
            key={item.id}
            className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-3 before:bottom-[-32px] before:w-[1px] before:bg-slate-200 last:before:hidden"
          >
            {/* Timeline Icon */}
            <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-300 shadow-sm z-10">
              <Briefcase size={10} className="text-slate-500" />
            </div>

            <div className="flex flex-col gap-1">
              {/* Vị trí công việc */}
              <input
                className="text-[15px] font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full outline-none placeholder:text-slate-300 transition-colors focus:placeholder:text-slate-200"
                value={item.title || ""}
                onChange={(e) =>
                  updateItemField(section.id, item.id, "title", e.target.value)
                }
                placeholder="Vị trí (ví dụ: Senior Frontend Developer)"
              />

              {/* Công ty & Thời gian */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-0.5">
                <input
                  className="text-[13px] font-semibold text-blue-600 bg-transparent border-none focus:ring-0 p-0 flex-1 outline-none placeholder:text-blue-200"
                  value={item.subtitle || ""}
                  onChange={(e) =>
                    updateItemField(
                      section.id,
                      item.id,
                      "subtitle",
                      e.target.value,
                    )
                  }
                  placeholder="Công ty (ví dụ: Google)"
                />

                <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-medium">
                  <Calendar size={12} className="shrink-0" />
                  <input
                    className="bg-transparent border-none focus:ring-0 p-0 w-32 text-right outline-none placeholder:text-slate-200"
                    value={item.date || ""}
                    onChange={(e) =>
                      updateItemField(
                        section.id,
                        item.id,
                        "date",
                        e.target.value,
                      )
                    }
                    placeholder="01/2022 - Hiện tại"
                  />
                </div>
              </div>

              {/* Mô tả chi tiết (Textarea tự co giãn) */}
              <textarea
                ref={(el) => setRef(item.id, el)}
                className="mt-2 text-[13px] text-slate-600 leading-relaxed bg-transparent border-none focus:ring-0 p-0 w-full resize-none overflow-hidden outline-none placeholder:text-slate-300"
                rows={1}
                value={item.description || ""}
                onChange={(e) => {
                  updateItemField(
                    section.id,
                    item.id,
                    "description",
                    e.target.value,
                  );
                  // Resize chiều cao ngay lập tức khi người dùng nhập liệu
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Mô tả các thành tựu, trách nhiệm chính..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
