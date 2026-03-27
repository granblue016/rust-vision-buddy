import React from "react";
import { CvSection, CvItem } from "../../../types/cv";
import { useCvStore } from "../../../stores/useCvStore";
import { X, Plus } from "lucide-react";
import { InlineRichText } from "./InlineRichText";

interface SkillsBlockProps {
  section: CvSection;
  isPreview?: boolean;
  primaryColor?: string;
  templateId?: string;
}

export const SkillsBlock: React.FC<SkillsBlockProps> = ({
  section,
  isPreview = false,
  primaryColor = "#6366f1",
  templateId = "standard",
}) => {
  const addItem = useCvStore((state) => state.addItem);
  const updateItemField = useCvStore((state) => state.updateItemField);
  const removeItem = useCvStore((state) => state.removeItem);

  if (!section || !section.visible) return null;

  const isHarvard = templateId.toLowerCase().includes("harvard");

  const cleanLabel = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  return (
    <div className={`py-1 w-full ${isHarvard ? "font-serif" : "font-sans"}`}>
      <div
        className={`flex flex-wrap items-center ${
          isHarvard ? "gap-x-1.5 gap-y-0.5" : "gap-2"
        }`}
      >
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className={`group/item relative flex items-center transition-all duration-200 ${
              isHarvard
                ? "bg-transparent px-0"
                : "bg-slate-50 border border-slate-200 px-3 py-1 rounded-md hover:bg-white hover:shadow-sm print:border-slate-100 print:bg-transparent print:px-2"
            }`}
          >
            {/* Nội dung Kỹ năng */}
            <div className="flex items-center">
              {isPreview ? (
                <span
                  className={`text-[13px] ${isHarvard ? "text-black" : "font-medium text-slate-700"}`}
                >
                  {cleanLabel(item.title || "")}
                </span>
              ) : (
                <InlineRichText
                  value={item.title || ""}
                  onChange={(val: string) =>
                    updateItemField(section.id, item.id, "title", val)
                  }
                  className={`min-w-[30px] outline-none bg-transparent text-[13px] ${
                    isHarvard ? "text-black" : "font-medium text-slate-700"
                  }`}
                  placeholder="Kỹ năng..."
                />
              )}

              {/* Dấu phẩy ngăn cách chuẩn Harvard (Ẩn khi in nếu là item cuối) */}
              {isHarvard && idx < section.items.length - 1 && (
                <span className="text-[13px] text-black ml-[-2px]">,</span>
              )}
            </div>

            {/* Nút xóa - Chỉ hiện khi hover và không phải bản in */}
            {!isPreview && (
              <button
                type="button"
                onClick={() => removeItem(section.id, item.id)}
                className="opacity-0 group-hover/item:opacity-100 ml-1 text-slate-400 hover:text-red-500 transition-all print:hidden"
              >
                <X size={isHarvard ? 10 : 12} />
              </button>
            )}
          </div>
        ))}

        {/* Nút thêm mới - Thiết kế tối giản */}
        {!isPreview && (
          <button
            type="button"
            onClick={() => addItem(section.id)}
            className={`flex items-center justify-center border border-dashed transition-all hover:bg-white print:hidden ${
              isHarvard
                ? "w-5 h-5 rounded-full ml-1"
                : "px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
            }`}
            style={{
              color: primaryColor,
              borderColor: `${primaryColor}60`,
              backgroundColor: `${primaryColor}05`,
            }}
          >
            <Plus size={isHarvard ? 12 : 14} />
            {!isHarvard && <span className="ml-1">Thêm</span>}
          </button>
        )}
      </div>

      {/* Placeholder khi trống */}
      {section.items.length === 0 && !isPreview && (
        <p className="text-[12px] text-slate-400 italic py-1">
          Chưa có kỹ năng nào...
        </p>
      )}
    </div>
  );
};

export default SkillsBlock;
