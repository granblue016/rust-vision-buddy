import React from "react";
import { CvSection, CvItem } from "../../../types/cv";
import { useCvStore } from "../../../stores/useCvStore";
import { X, Plus } from "lucide-react";
import InlineRichText from "./InlineRichText"; // Sửa lại import default nếu cần

interface SkillsBlockProps {
  section: CvSection;
  isPreview?: boolean;
  primaryColor?: string; // Nhận màu từ CVPreview để đồng bộ theme
}

export const SkillsBlock: React.FC<SkillsBlockProps> = ({
  section,
  isPreview = false,
  primaryColor = "#6366f1",
}) => {
  const addItem = useCvStore((state) => state.addItem);
  const updateItemField = useCvStore((state) => state.updateItemField);
  const removeItem = useCvStore((state) => state.removeItem);

  // Guard clause
  if (!section || !section.visible) return null;

  /**
   * Làm sạch dữ liệu triệt để cho bản in
   */
  const cleanLabel = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
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
                ? "bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm"
                : "bg-transparent border-slate-100 print:border-none print:px-0 print:py-0"
            }`}
            style={
              !isPreview
                ? {
                    // Khi hover sẽ đổi màu border theo primaryColor
                  }
                : {}
            }
            onMouseOver={(e) => {
              if (!isPreview) e.currentTarget.style.borderColor = primaryColor;
            }}
            onMouseOut={(e) => {
              if (!isPreview) e.currentTarget.style.borderColor = "#e2e8f0"; // border-slate-200
            }}
          >
            {/* Tên Kỹ năng */}
            {isPreview ? (
              <span
                className="text-[13px] font-medium leading-none block print:text-black print:text-[12px]"
                style={{ color: "#334155" }} // text-slate-700
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

            {/* Nút xóa */}
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

        {/* Nút thêm mới - Đồng bộ màu với primaryColor */}
        {!isPreview && (
          <button
            type="button"
            onClick={() => addItem(section.id)}
            className="flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-md border border-dashed transition-all print:hidden h-[26px] uppercase tracking-wider active:scale-95"
            style={{
              color: primaryColor,
              backgroundColor: `${primaryColor}10`, // Thêm 10% opacity cho background
              borderColor: primaryColor,
            }}
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
        }
      `}</style>
    </div>
  );
};

export default SkillsBlock;
