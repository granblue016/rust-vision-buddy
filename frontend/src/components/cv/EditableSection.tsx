import React from "react";
import { CvSection, CvItem } from "@/types/cv";
import { useCvStore } from "@/stores/useCvStore";
import EditableField from "./EditableField";
import SortableSection from "./SortableSection";
import DraggableWrapper from "./DraggableWrapper"; // Import Wrapper kéo thả
import { PlusCircle } from "lucide-react";

interface EditableSectionProps {
  section: CvSection;
}

const EditableSection = ({ section }: EditableSectionProps) => {
  const { updateItemField, addItem, toggleSectionVisibility, data } =
    useCvStore();

  const primaryColor = data?.theme?.primary_color || "#2563eb";

  return (
    /* Bọc toàn bộ Section vào DraggableWrapper để có thể kéo thả thay đổi thứ tự */
    <DraggableWrapper id={section.id}>
      <SortableSection
        id={section.id}
        title={section.title}
        isVisible={section.visible}
        onToggleVisibility={() => toggleSectionVisibility(section.id)}
      >
        <div className="space-y-8">
          {section.items.map((item: CvItem) => (
            <div key={item.id} className="group/item relative">
              {/* Tiêu đề chính và Ngày tháng */}
              <div className="flex justify-between items-baseline mb-1">
                <EditableField
                  value={item.title}
                  onSave={(val) =>
                    updateItemField(section.id, item.id, "title", val)
                  }
                  className="font-bold text-lg text-slate-800 w-full"
                  placeholder={
                    section.type === "education"
                      ? "Tên trường học"
                      : "Tên công ty"
                  }
                />
                <EditableField
                  value={item.date || ""}
                  onSave={(val) =>
                    updateItemField(section.id, item.id, "date", val)
                  }
                  className="text-xs text-slate-400 font-bold whitespace-nowrap ml-4 italic uppercase"
                  placeholder="Tháng/Năm"
                />
              </div>

              {/* Tiêu đề phụ (Vị trí/Chuyên ngành) */}
              <EditableField
                value={item.subtitle || ""}
                onSave={(val) =>
                  updateItemField(section.id, item.id, "subtitle", val)
                }
                className="text-sm font-bold block mb-2"
                style={{ color: primaryColor }}
                placeholder={
                  section.type === "education"
                    ? "Chuyên ngành"
                    : "Vị trí công việc"
                }
              />

              {/* Nội dung chi tiết */}
              <EditableField
                value={item.description || ""}
                isTextArea
                onSave={(val) =>
                  updateItemField(section.id, item.id, "description", val)
                }
                className="text-slate-600 text-sm leading-relaxed"
                placeholder="Mô tả chi tiết công việc hoặc thành tựu..."
              />
            </div>
          ))}
        </div>

        {/* Nút thêm Item mới */}
        <button
          onClick={() => addItem(section.id, section.type)}
          className="mt-6 opacity-0 group-hover/section:opacity-100 transition-all text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 border-dashed flex items-center gap-2"
        >
          <PlusCircle size={12} /> Thêm {section.title}
        </button>
      </SortableSection>
    </DraggableWrapper>
  );
};

export default EditableSection;
