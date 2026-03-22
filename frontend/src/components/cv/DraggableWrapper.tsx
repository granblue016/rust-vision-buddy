import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface DraggableWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DraggableWrapper = ({ id, children, className }: DraggableWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/draggable relative",
        isDragging && "opacity-50 scale-[1.02] shadow-2xl z-50 ring-2 ring-indigo-500 rounded-xl bg-white",
        className
      )}
    >
      {/* Handle - Tay cầm để kéo (Chỉ hiện khi hover) */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-10 top-2 p-2 cursor-grab active:cursor-grabbing text-slate-300",
          "hover:text-indigo-500 opacity-0 group-hover/draggable:opacity-100 transition-all",
          isDragging && "opacity-100 text-indigo-600"
        )}
      >
        <GripVertical size={20} strokeWidth={2.5} />
      </div>

      {/* Nội dung bên trong (Section) */}
      {children}
    </div>
  );
};

export default DraggableWrapper;
