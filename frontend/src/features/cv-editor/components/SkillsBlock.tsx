import React from "react";
import { CvSection, CvItem } from "@/types/cv";
import { useCvStore } from "@/stores/useCvStore";
import { X, Plus } from "lucide-react";
import InlineRichText from "./InlineRichText";

interface SkillsBlockProps {
  section: CvSection;
}

export const SkillsBlock: React.FC<SkillsBlockProps> = ({ section }) => {
  // Lấy các hàm điều khiển từ Store
  const { addItem, updateItemField, removeItem } = useCvStore();

  // Guard clause: Nếu section bị ẩn hoặc không tồn tại
  if (!section || !section.visible) return null;

  return (
    <div className="group/skills-container relative py-2">
      <div className="flex flex-wrap gap-2 pt-1">
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className="group/item relative flex items-center bg-slate-50 hover:bg-white px-3 py-1 rounded-md border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all duration-200"
          >
            {/* Tên Kỹ năng - Đã xóa hoàn toàn placeholder "Kỹ năng..." */}
            <InlineRichText
              value={item.title || ""}
              onChange={(val) =>
                updateItemField(section.id, item.id, "title", val)
              }
              className="text-[13px] font-medium text-slate-700 min-w-[20px] leading-none block"
              placeholder=""
            />

            {/* Nút xóa kỹ năng - Hiện khi hover vào Tag */}
            <button
              type="button"
              onClick={() => removeItem(section.id, item.id)}
              className="ml-1 opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 transition-opacity print:hidden shrink-0"
              title="Xóa kỹ năng"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Nút thêm mới - Style đồng bộ, nhỏ gọn */}
        <button
          type="button"
          onClick={() => addItem(section.id)}
          className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 px-2 py-1 rounded-md border border-dashed border-indigo-200 transition-colors print:hidden h-[26px] uppercase tracking-wider"
        >
          <Plus size={12} />
          <span>Thêm</span>
        </button>
      </div>

      {/* Thông báo khi trống - Chỉ hiện trong trình chỉnh sửa, không in ra */}
      {section.items.length === 0 && (
        <p className="text-[11px] text-slate-400 italic py-2 print:hidden">
          Chưa có kỹ năng nào được thêm...
        </p>
      )}
    </div>
  );
};

export default SkillsBlock;
