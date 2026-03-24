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
            className="group/item relative flex items-center bg-slate-50 hover:bg-white px-3 py-1 rounded-md border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
          >
            {/* Tên Kỹ năng - Sử dụng InlineRichText mới không còn gạch đỏ props */}
            <InlineRichText
              value={item.title || ""}
              onChange={(val) =>
                updateItemField(section.id, item.id, "title", val)
              }
              className="text-[13px] font-medium text-slate-700 min-w-[40px] leading-none"
              placeholder="Kỹ năng..."
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

        {/* Nút thêm mới - Style đồng bộ với các tag kỹ năng */}
        <button
          type="button"
          onClick={() => addItem(section.id)}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 bg-blue-50/50 hover:bg-blue-50 px-3 py-1 rounded-md border border-dashed border-blue-200 transition-colors print:hidden h-[28px] uppercase tracking-wider"
        >
          <Plus size={12} />
          <span>Thêm</span>
        </button>
      </div>

      {/* Hiển thị thông báo khi danh sách trống */}
      {section.items.length === 0 && (
        <p className="text-[12px] text-slate-400 italic py-2">
          Nhấp vào nút "Thêm" để bắt đầu liệt kê các kỹ năng của bạn...
        </p>
      )}
    </div>
  );
};

export default SkillsBlock;
