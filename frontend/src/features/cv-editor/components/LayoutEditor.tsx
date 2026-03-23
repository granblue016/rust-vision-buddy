import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useCvStore } from "@/stores/useCvStore";
import { LayoutColumnId, CvSection, CvItem } from "@/types/cv";
import { GripVertical, EyeOff, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const LayoutEditor = () => {
  const { data, moveSection, toggleSectionVisibility } = useCvStore();

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    moveSection(
      draggableId,
      source.droppableId as LayoutColumnId,
      destination.droppableId as LayoutColumnId,
      destination.index,
    );
  };

  const getSectionById = (id: string): CvSection | undefined => {
    return data.sections.find((s) => s.id === id);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-8 p-6 max-w-5xl mx-auto pb-24">
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xl p-12 min-h-[1100px] relative transition-all">
          <div className="absolute top-4 right-4 text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] select-none">
            A4 Preview Canvas
          </div>

          {/* Vùng đầu trang */}
          <div className="mb-10 group/canvas relative">
            <SectionColumn
              id="fullWidth"
              sectionIds={data.layout.fullWidth}
              getSection={getSectionById}
              toggleVisibility={toggleSectionVisibility}
            />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Cột Trái */}
            <div className="col-span-4 border-r border-slate-100 pr-8">
              <SectionColumn
                id="leftColumn"
                sectionIds={data.layout.leftColumn}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
              />
            </div>

            {/* Cột Phải */}
            <div className="col-span-8">
              <SectionColumn
                id="rightColumn"
                sectionIds={data.layout.rightColumn}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
              />
            </div>
          </div>
        </div>

        {/* KHO LƯU TRỮ */}
        <div className="bg-slate-900/5 border-2 border-dashed border-slate-200 rounded-3xl p-8 transition-all">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-4">
            Kho lưu trữ
          </h3>
          <SectionColumn
            id="unused"
            sectionIds={data.layout.unused}
            getSection={getSectionById}
            toggleVisibility={toggleSectionVisibility}
            isHorizontal
          />
        </div>
      </div>
    </DragDropContext>
  );
};

// --- HÀM RENDER ĐÃ SỬA ĐỂ HIỂN THỊ ĐÚNG DỮ LIỆU ---
const renderSectionContent = (section: CvSection) => {
  if (!section.items || section.items.length === 0) {
    return (
      <span className="text-slate-400 italic text-[10px]">
        Chưa có nội dung cho {section.title}...
      </span>
    );
  }

  switch (section.type) {
    case "header":
      const info = section.items[0];
      return (
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-slate-800 uppercase">
            {info.title || "HỌ TÊN CỦA BẠN"}
          </h1>
          <p className="text-xs text-indigo-600 font-bold">
            {info.subtitle || "Vị trí ứng tuyển"}
          </p>
        </div>
      );

    case "experience":
      return (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 mb-2">
            {section.title}
          </h4>
          {section.items.map((item: CvItem, idx: number) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-start text-[11px]">
                <span className="font-bold text-slate-800 uppercase">
                  {item.title || "Tên công ty/Tổ chức"}
                </span>
                <span className="text-slate-400 font-mono text-[9px] shrink-0 ml-2">
                  {item.date || "MM/YYYY - Hiện tại"}
                </span>
              </div>
              {/* Vị trí công việc */}
              <p className="text-[10px] text-indigo-500 font-medium italic -mt-0.5">
                {item.subtitle || "Vị trí đảm nhiệm"}
              </p>
              {/* Mô tả công việc */}
              {item.description && (
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 text-justify">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case "education":
      return (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 mb-2">
            {section.title}
          </h4>
          {section.items.map((item: CvItem, idx: number) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between items-start text-[11px]">
                <span className="font-bold text-slate-800">
                  {item.subtitle || "Ngành học/Khóa học"}
                </span>
                <span className="text-slate-400 font-mono text-[9px] shrink-0 ml-2">
                  {item.date}
                </span>
              </div>
              {/* Tên trường học */}
              <p className="text-[10px] text-slate-600">
                {item.title || "Tên trường đại học/trung tâm"}
              </p>
              {/* Điểm số hoặc mô tả thêm nếu có */}
              {item.description && (
                <p className="text-[9px] text-slate-400 italic">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    case "projects": // Thêm case projects vào đây
      return (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 mb-2">
            {section.title}
          </h4>
          {section.items.map((item: CvItem, idx: number) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between items-start text-[11px]">
                <span className="font-bold text-slate-800">
                  {/* Ưu tiên hiển thị title (Tên dự án/Công ty) */}
                  {item.title || "Tên đơn vị"}
                </span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {item.date}
                </span>
              </div>
              {item.subtitle && (
                <p className="text-[10px] text-slate-500 italic">
                  {item.subtitle}
                </p>
              )}
              {item.description && (
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case "skills":
      return (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {section.title}
          </h4>
          <div className="flex flex-wrap gap-1">
            {section.items.map((s: CvItem, i: number) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600"
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-slate-800 uppercase">
            {section.title}
          </h4>
          {section.items.map((item, idx) => (
            <p key={idx} className="text-[10px] text-slate-600">
              {item.title}
            </p>
          ))}
        </div>
      );
  }
};

// --- CÁC COMPONENT HỖ TRỢ GIỮ NGUYÊN ---
interface ColumnProps {
  id: LayoutColumnId;
  sectionIds: string[];
  getSection: (id: string) => CvSection | undefined;
  toggleVisibility: (id: string) => void;
  isHorizontal?: boolean;
}

const SectionColumn = ({
  id,
  sectionIds,
  getSection,
  toggleVisibility,
  isHorizontal,
}: ColumnProps) => {
  return (
    <Droppable
      droppableId={id}
      direction={isHorizontal ? "horizontal" : "vertical"}
    >
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cn(
            "flex gap-4 min-h-[50px] transition-all rounded-xl",
            isHorizontal ? "flex-row flex-wrap p-2 bg-slate-50/50" : "flex-col",
            snapshot.isDraggingOver && "bg-indigo-50/30 ring-2 ring-indigo-100",
          )}
        >
          {sectionIds.map((sid, index) => {
            const section = getSection(sid);
            if (!section) return null;

            return (
              <Draggable key={sid} draggableId={sid} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "group relative bg-white transition-all",
                      snapshot.isDragging
                        ? "shadow-2xl ring-2 ring-indigo-500 scale-[1.02] z-50 rounded-xl p-4"
                        : "hover:ring-1 hover:ring-indigo-100 rounded-lg",
                      !section.visible &&
                        id !== "unused" &&
                        "opacity-30 grayscale",
                      id === "unused" &&
                        "border border-slate-200 p-3 rounded-xl w-40 shadow-sm",
                    )}
                  >
                    <div className="relative p-2">
                      <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                        <div
                          {...provided.dragHandleProps}
                          className="p-1 bg-white shadow-md border rounded text-slate-400 hover:text-indigo-600"
                        >
                          <GripVertical className="w-3 h-3" />
                        </div>
                        <button
                          onClick={() => toggleVisibility(sid)}
                          className="p-1 bg-white shadow-md border rounded text-slate-400 hover:text-red-500"
                        >
                          {section.visible ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div
                        className={cn(
                          id === "unused" ? "text-center" : "text-left",
                        )}
                      >
                        {id === "unused" ? (
                          <span className="text-[10px] font-black text-slate-700 uppercase">
                            {section.title}
                          </span>
                        ) : (
                          renderSectionContent(section)
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default LayoutEditor;
