import React from "react";
import { CvSection, CvItem } from "../../../types/cv";
import { useCvStore } from "../../../stores/useCvStore";
import { X, Plus } from "lucide-react";

interface SkillsBlockProps {
  section: CvSection;
}

export const SkillsBlock: React.FC<SkillsBlockProps> = ({ section }) => {
  const { updateItemField, removeItem, addItem } = useCvStore();

  if (!section.visible) return null;

  return (
    <div className="group/skills-container relative">
      <div className="flex flex-wrap gap-2 pt-1">
        {section.items.map((item: CvItem) => (
          <div
            key={item.id}
            className="group relative flex items-center bg-slate-50 hover:bg-white px-3 py-1 rounded-md border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
          >
            <input
              className="bg-transparent border-none focus:ring-0 p-0 text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-300"
              value={item.title || ""}
              onChange={(e) =>
                updateItemField(section.id, item.id, "title", e.target.value)
              }
              // Tự động giãn chiều rộng dựa trên độ dài chữ, tối thiểu 40px
              style={{ width: `${Math.max(item.title?.length || 0, 4)}ch` }}
              placeholder="Kỹ năng..."
            />

            {/* Nút xóa - Chỉ hiện khi hover và KHÔNG HIỆN khi in */}
            <button
              onClick={() => removeItem(section.id, item.id)}
              className="ml-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity print:hidden"
              title="Xóa kỹ năng"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Nút thêm mới - KHÔNG HIỆN khi in */}
        <button
          onClick={() => addItem(section.id, "skills")}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 bg-blue-50/50 hover:bg-blue-50 px-3 py-1 rounded-md border border-dashed border-blue-200 transition-colors print:hidden"
        >
          <Plus size={12} />
          <span>THÊM</span>
        </button>
      </div>

      {/* Ghi chú nhỏ khi không có item nào */}
      {section.items.length === 0 && (
        <p className="text-xs text-slate-400 italic py-2">
          Chưa có kỹ năng nào được thêm...
        </p>
      )}
    </div>
  );
};
