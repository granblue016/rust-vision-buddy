import React from "react";
import { CvSection, CvItem } from "../../../types/cv";
import { useCvStore } from "../../../stores/useCvStore";
import { X, Plus } from "lucide-react";
import { InlineRichText } from "./InlineRichText";

interface SkillsBlockProps {
  section: CvSection;
  isPreview?: boolean;
}

export const SkillsBlock: React.FC<SkillsBlockProps> = ({
  section,
  isPreview = false,
}) => {
  const addItem = useCvStore((state) => state.addItem);
  const updateItemField = useCvStore((state) => state.updateItemField);
  const removeItem = useCvStore((state) => state.removeItem);

  // Guard clause
  if (!section || !section.visible) return null;

  /**
   * Làm sạch dữ liệu triệt để cho bản in
   * Loại bỏ <p>, <span>, &nbsp; và các ký tự trắng dư thừa
   */
  const cleanLabel = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>/g, "") // Xóa tất cả các thẻ HTML
      .replace(/&nbsp;/g, " ") // Thay thế khoảng trắng đặc biệt
      .trim();
  };

  return (
    <div className="group/skills-container relative py-2 w-full">
      <div className="flex flex-wrap gap-2 pt-1">
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className={`group/item relative flex items-center px-3 py-1 rounded-md border transition-all duration-200 break-inside-avoid ${
              !isPreview
                ? "bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-400 hover:shadow-sm"
                : "bg-transparent border-slate-100 print:border-none print:px-0 print:py-0"
            }`}
          >
            {/* Tên Kỹ năng */}
            {isPreview ? (
              <span
                className="text-[13px] font-medium text-slate-700 leading-none block print:text-black print:text-[12px]"
                dangerouslySetInnerHTML={{
                  __html: cleanLabel(item.title || ""),
                }}
              />
            ) : (
              <InlineRichText
                value={item.title || ""}
                onChange={(val: string) =>
                  updateItemField(section.id, item.id, "title", val)
                }
                className="text-[13px] font-medium text-slate-700 min-w-[20px] leading-none block outline-none bg-transparent"
                placeholder="Tên kỹ năng..."
              />
            )}

            {/* Nút xóa - Tự động ẩn khi In (print:hidden) */}
            {!isPreview && (
              <button
                type="button"
                onClick={() => removeItem(section.id, item.id)}
                className="ml-2 opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 transition-opacity print:hidden shrink-0 focus:opacity-100"
                aria-label="Xóa kỹ năng"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {/* Nút thêm mới - Thiết kế tinh tế, ẩn khi in */}
        {!isPreview && (
          <button
            type="button"
            onClick={() => addItem(section.id)}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 px-3 py-1 rounded-md border border-dashed border-indigo-300 transition-all print:hidden h-[26px] uppercase tracking-wider active:scale-95"
          >
            <Plus size={12} strokeWidth={3} />
            <span>Thêm kỹ năng</span>
          </button>
        )}
      </div>

      {/* Thông báo trạng thái trống */}
      {section.items.length === 0 && !isPreview && (
        <p className="text-[11px] text-slate-400 italic py-2 print:hidden animate-pulse">
          Chưa có kỹ năng nào. Nhấn "Thêm kỹ năng" để bắt đầu...
        </p>
      )}

      {/* CSS dành riêng cho khu vực Skills khi In */}
      <style>{`
        @media print {
          .group\\/skills-container {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            display: inline-block;
          }
          /* Nếu muốn kỹ năng dạng danh sách cách nhau dấu phẩy thay vì khung */
          /* .group\\/item:not(:last-child):after { content: ", "; } */
        }
      `}</style>
    </div>
  );
};

export default SkillsBlock;
