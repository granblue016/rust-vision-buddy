import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  GripVertical,
  Eye,
  EyeOff,
  FileText,
  User,
  Target,
  GraduationCap,
  Briefcase,
  Wrench,
  Layers,
  Layout,
  PlusCircle,
} from "lucide-react";
import { useCvStore } from "@/stores/useCvStore";
import { LayoutColumnId } from "@/types/cv";
import { cn } from "@/lib/utils";

// Map icon tương ứng với từng loại section
const sectionIcons: Record<string, React.ElementType> = {
  header: User,
  summary: Target,
  education: GraduationCap,
  experience: Briefcase,
  skills: Wrench,
  projects: Layers,
};

const LayoutSidebar = () => {
  const { data, reorderSections, moveSection, toggleSectionVisibility } =
    useCvStore();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = source.droppableId as LayoutColumnId;
    const destCol = destination.droppableId as LayoutColumnId;

    if (sourceCol === destCol) {
      const currentIds = Array.from(data.layout[sourceCol]);
      const [removed] = currentIds.splice(source.index, 1);
      currentIds.splice(destination.index, 0, removed);
      reorderSections(sourceCol, currentIds);
    } else {
      moveSection(draggableId, sourceCol, destCol, destination.index);
    }
  };

  const renderDroppableColumn = (
    columnId: LayoutColumnId,
    label: string,
    isUnused = false,
  ) => {
    const sectionIds = data.layout[columnId] || [];

    return (
      <div
        className={cn(
          "mb-6",
          isUnused && "mt-4 pt-4 border-t border-slate-200",
        )}
      >
        <div className="px-4 mb-3 flex items-center justify-between">
          <h3
            className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isUnused ? "text-slate-400" : "text-indigo-600",
            )}
          >
            {label}
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">
            {sectionIds.length}
          </span>
        </div>

        <Droppable droppableId={columnId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "px-3 space-y-2 min-h-[60px] transition-all duration-200 rounded-xl mx-2 border-2 border-transparent",
                snapshot.isDraggingOver &&
                  "bg-indigo-50/50 border-dashed border-indigo-200 shadow-inner",
              )}
            >
              {sectionIds.map((id, index) => {
                const section = data.sections.find((s) => s.id === id);
                if (!section) return null;

                const Icon = sectionIcons[section.type] || FileText;

                return (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all duration-200 shadow-sm",
                          snapshot.isDragging
                            ? "bg-white border-indigo-500 shadow-xl scale-[1.05] z-50"
                            : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md",
                          !section.visible && "opacity-50 grayscale-[0.5]",
                        )}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="text-slate-300 hover:text-indigo-400 transition-colors"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div
                          className={cn(
                            "p-1.5 rounded-lg",
                            section.visible
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-slate-100 text-slate-400",
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                        </div>

                        <span className="flex-1 text-[12px] font-bold text-slate-700 truncate">
                          {section.title}
                        </span>

                        <button
                          onClick={() => toggleSectionVisibility(section.id)}
                          className={cn(
                            "p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                            section.visible
                              ? "hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                              : "hover:bg-indigo-50 text-indigo-600",
                          )}
                        >
                          {section.visible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}

              {sectionIds.length === 0 && (
                <div className="flex flex-col items-center justify-center py-4 border border-dashed border-slate-200 rounded-xl text-slate-400">
                  <PlusCircle className="w-4 h-4 mb-1 opacity-20" />
                  <span className="text-[10px] font-medium italic">Trống</span>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  return (
    <aside className="w-full flex flex-col h-full bg-white">
      {/* Header Sidebar */}
      <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
            <Layout className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-black text-sm tracking-tight text-slate-800 uppercase">
              Cấu trúc CV
            </h2>
            <p className="text-[10px] text-slate-400 font-bold">
              Kéo thả để sắp xếp
            </p>
          </div>
        </div>
      </div>

      {/* Vùng chứa các cột có thể kéo thả */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Nhóm hiển thị */}
          {renderDroppableColumn("fullWidth", "Vùng đầu trang (100%)")}
          {renderDroppableColumn("leftColumn", "Cột trái (33%)")}
          {renderDroppableColumn("rightColumn", "Cột phải (66%)")}

          {/* Nhóm lưu trữ - Khớp với key 'unused' trong CvLayout */}
          {renderDroppableColumn("unused", "Kho mục lưu trữ", true)}
        </DragDropContext>
      </div>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Đồng bộ thời gian thực với Rust
        </div>
      </div>
    </aside>
  );
};

export default LayoutSidebar;
