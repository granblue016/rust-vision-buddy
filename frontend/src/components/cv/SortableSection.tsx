import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Layout } from "lucide-react";
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

  /**
   * Sử dụng Translate thay vì Transform để tránh lỗi làm mờ (blur) văn bản
   * trên các trình duyệt dựa trên Chromium khi thực hiện kéo thả.
   */
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cv-section group relative bg-white border-2 border-transparent rounded-xl p-5 mb-5 transition-all duration-300",
        "hover:border-indigo-100 hover:shadow-md",
        isDragging &&
          "opacity-40 shadow-2xl border-indigo-500 scale-[1.02] bg-slate-50 z-50 ring-2 ring-indigo-200",
        !isVisible &&
          "opacity-50 grayscale bg-slate-50/50 italic shadow-none border-dashed border-slate-200",
      )}
    >
      {/* 1. NÚT ĐIỀU KHIỂN (Floating Action Bar) - Xuất hiện khi hover */}
      <div className="absolute -left-14 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
        {/* Nút Kéo Thả (Drag Handle) */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 bg-white shadow-lg border border-slate-100 rounded-lg cursor-grab active:cursor-grabbing hover:bg-indigo-600 hover:text-white transition-colors group/btn"
          title="Nhấn giữ để di chuyển vị trí"
        >
          <GripVertical size={18} className="group-active/btn:scale-110" />
        </button>

        {/* Nút Ẩn/Hiện Section */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={cn(
            "p-2 bg-white shadow-lg border border-slate-100 rounded-lg transition-all",
            !isVisible
              ? "text-rose-500 bg-rose-50 border-rose-100 shadow-rose-100/50"
              : "hover:text-amber-500 hover:bg-amber-50",
          )}
          title={isVisible ? "Ẩn mục này khỏi bản in CV" : "Hiển thị mục này"}
        >
          {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {/* 2. HEADER CỦA SECTION - Phong cách TopCV */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              isVisible
                ? "bg-indigo-50 text-indigo-600"
                : "bg-slate-200 text-slate-400",
            )}
          >
            <Layout size={16} />
          </div>
          <h3
            className={cn(
              "text-xs font-black uppercase tracking-[0.15em] transition-all",
              isVisible ? "text-slate-800" : "text-slate-400",
            )}
          >
            {title}
          </h3>
        </div>

        {!isVisible && (
          <span className="text-[10px] font-bold text-rose-400 bg-rose-50 px-2 py-0.5 rounded uppercase">
            Đã ẩn
          </span>
        )}
      </div>

      {/* 3. NỘI DUNG CHI TIẾT (Children) */}
      <div
        className={cn(
          "transition-all duration-500 origin-top",
          !isVisible
            ? "blur-[2px] opacity-40 pointer-events-none select-none scale-[0.98]"
            : "opacity-100 scale-100",
        )}
      >
        {children}
      </div>

      {/* 4. DROP INDICATOR (Hiệu ứng khi thả) */}
      <div className="absolute inset-x-0 -bottom-2.5 h-1 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-0 transition-opacity pointer-events-none drop-indicator" />
    </div>
  );
};

export default SortableSection;
