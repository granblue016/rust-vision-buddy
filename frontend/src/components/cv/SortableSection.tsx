import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableSectionProps {
  id: string;
  title: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  children: React.ReactNode;
}

const SortableSection = ({
  id,
  title,
  isVisible,
  onToggleVisibility,
  children,
}: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Tối ưu transform để tránh làm mờ chữ (blur) khi kéo thả
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative border-2 border-transparent rounded-lg p-4 mb-6 bg-white transition-all",
        "hover:border-indigo-100",
        isDragging &&
          "z-50 opacity-40 shadow-2xl border-indigo-400 scale-[1.02]",
        !isVisible && "opacity-50 grayscale bg-slate-50",
      )}
    >
      {/* Thanh điều khiển (Handle) - Nằm bên ngoài lề trái */}
      <div className="absolute -left-12 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 bg-white shadow-md border border-slate-200 rounded-md hover:bg-indigo-50 cursor-grab active:cursor-grabbing transition-colors"
          title="Kéo để sắp xếp"
        >
          <GripVertical
            size={18}
            className="text-slate-400 group-hover:text-indigo-500"
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Tránh kích hoạt kéo khi nhấn nút
            onToggleVisibility();
          }}
          className="p-2 bg-white shadow-md border border-slate-200 rounded-md hover:bg-indigo-50 transition-colors"
          title={isVisible ? "Ẩn mục này" : "Hiện mục này"}
        >
          {isVisible ? (
            <Eye size={18} className="text-slate-500" />
          ) : (
            <EyeOff size={18} className="text-red-400" />
          )}
        </button>
      </div>

      {/* Tiêu đề Section */}
      <div className="flex items-center gap-2 mb-4">
        <h3
          className={cn(
            "text-lg font-bold uppercase tracking-wider pb-1 flex-1 border-b-2",
            isVisible
              ? "text-slate-800 border-slate-200"
              : "text-slate-400 border-transparent",
          )}
        >
          {title}
        </h3>
      </div>

      {/* Nội dung bên trong */}
      <div
        className={cn(
          "transition-all duration-300",
          !isVisible &&
            "pointer-events-none select-none overflow-hidden max-h-20",
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default SortableSection;
