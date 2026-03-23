import React, { useRef, useLayoutEffect, useCallback } from "react";
import { CvSection, CvItem } from "../../../types/cv";
import { useCvStore } from "../../../stores/useCvStore";
// SỬA LỖI: Thay FolderCode (không tồn tại) bằng FolderGit2
import { FolderGit2, Link as LinkIcon } from "lucide-react";

interface ProjectsBlockProps {
  section: CvSection;
}

export const ProjectsBlock: React.FC<ProjectsBlockProps> = ({ section }) => {
  const { updateItemField } = useCvStore();

  // Ref quản lý textarea để tự động co giãn theo nội dung
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const setRef = useCallback((id: string, el: HTMLTextAreaElement | null) => {
    if (el) {
      textareaRefs.current.set(id, el);
    } else {
      textareaRefs.current.delete(id);
    }
  }, []);

  // Effect điều chỉnh chiều cao textarea khi dữ liệu thay đổi
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
    <div className="space-y-6 py-2">
      {section.items.map((item: CvItem) => (
        <div
          key={item.id}
          className="group relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-3 before:bottom-[-24px] before:w-[1px] before:bg-slate-200 last:before:hidden"
        >
          {/* Biểu tượng dự án - Sửa lỗi icon TS 2724 */}
          <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-300 shadow-sm z-10">
            <FolderGit2 size={12} className="text-slate-500" />
          </div>

          <div className="flex flex-col gap-1">
            {/* Tên Dự Án & Link */}
            <div className="flex justify-between items-center gap-4">
              <input
                className="w-full font-bold text-[15px] text-blue-600 bg-transparent border-none focus:ring-0 p-0 uppercase tracking-wide outline-none placeholder:text-blue-200"
                value={item.title || ""}
                onChange={(e) =>
                  updateItemField(section.id, item.id, "title", e.target.value)
                }
                placeholder="TÊN DỰ ÁN"
              />

              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <LinkIcon size={12} />
                <input
                  className="bg-transparent border-none focus:ring-0 p-0 w-32 text-right text-[11px] italic outline-none placeholder:text-slate-200"
                  value={item.subtitle || ""}
                  onChange={(e) =>
                    updateItemField(
                      section.id,
                      item.id,
                      "subtitle",
                      e.target.value,
                    )
                  }
                  placeholder="github.com/link..."
                />
              </div>
            </div>

            {/* Mô tả dự án - Tự động co giãn theo nội dung */}
            <textarea
              ref={(el) => setRef(item.id, el)}
              className="mt-1.5 text-[13px] text-slate-600 leading-relaxed bg-transparent border-none focus:ring-0 p-0 w-full resize-none overflow-hidden outline-none placeholder:text-slate-300"
              rows={1}
              value={item.description || ""}
              onChange={(e) => {
                updateItemField(
                  section.id,
                  item.id,
                  "description",
                  e.target.value,
                );
                // Cập nhật chiều cao tức thì khi gõ
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Mô tả công nghệ sử dụng và vai trò của bạn..."
            />
          </div>
        </div>
      ))}
    </div>
  );
};
