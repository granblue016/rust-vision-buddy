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
    zIndex: isDragging ? 50 : "auto", // Đảm bảo section đang kéo luôn nằm trên
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative border-2 border-transparent rounded-xl p-4 mb-4 bg-white transition-all duration-200",
        "hover:border-indigo-100 hover:shadow-sm",
        isDragging &&
          "opacity-40 shadow-2xl border-indigo-400 scale-[1.01] bg-slate-50",
        !isVisible && "opacity-60 grayscale bg-slate-50/50",
      )}
    >
      {/* Thanh điều khiển (Handle) - Nằm bên ngoài lề trái để không đè vào nội dung CV */}
      <div className="absolute -left-14 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 bg-white shadow-lg border border-slate-100 rounded-lg cursor-grab active:cursor-grabbing hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          title="Kéo để sắp xếp vị trí"
        >
          <GripVertical size={18} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={cn(
            "p-2 bg-white shadow-lg border border-slate-100 rounded-lg transition-all",
            isVisible
              ? "hover:text-amber-500"
              : "text-red-500 bg-red-50 border-red-100",
          )}
          title={isVisible ? "Ẩn mục này" : "Hiện mục này"}
        >
          {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {/* Header của Section */}
      <div className="flex items-center gap-2 mb-6 group/title">
        <h3
          className={cn(
            "text-xl font-black uppercase tracking-[0.2em] pb-2 flex-1 border-b-2 transition-colors",
            isVisible
              ? "text-slate-900 border-slate-100 group-hover/section:border-indigo-200"
              : "text-slate-400 border-transparent",
          )}
        >
          {title}
        </h3>
      </div>

      {/* Nội dung bên trong: Blur nhẹ khi bị ẩn để tập trung vào phần đang hiển thị */}
      <div
        className={cn(
          "transition-all duration-500",
          !isVisible &&
            "pointer-events-none select-none blur-[2px] max-h-[100px] overflow-hidden",
        )}
      >
        {children}
      </div>

      {/* Overlay thông báo khi section bị ẩn */}
      {!isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 rounded-xl">
          <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-tighter opacity-50">
            Mục này sẽ không xuất hiện trên bản in
          </span>
        </div>
      )}
    </div>
  );
};

export default SortableSection;
