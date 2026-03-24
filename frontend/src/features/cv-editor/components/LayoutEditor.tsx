import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useCvStore } from "@/stores/useCvStore";
import { LayoutColumnId, CvSection, CvItem } from "@/types/cv";
import { GripVertical, EyeOff, Plus, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineRichText } from "./InlineRichText"; // Đảm bảo đường dẫn này đúng

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
        {/* Tờ giấy A4 Preview */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xl p-12 min-h-[1100px] relative transition-all overflow-hidden font-sans">
          <div className="absolute top-4 right-4 text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] select-none">
            A4 Preview Canvas
          </div>

          {/* Vùng đầu trang (Full Width) */}
          <div className="mb-10 group/canvas relative">
            <SectionColumn
              id="fullWidth"
              sectionIds={data.layout.fullWidth}
              getSection={getSectionById}
              toggleVisibility={toggleSectionVisibility}
            />
          </div>

          <div className="grid grid-cols-12 gap-10">
            {/* Cột Trái (Thường là thông tin phụ) */}
            <div className="col-span-4 border-r border-slate-100 pr-8 space-y-8">
              <SectionColumn
                id="leftColumn"
                sectionIds={data.layout.leftColumn}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
              />
            </div>

            {/* Cột Phải (Nội dung chính) */}
            <div className="col-span-8 space-y-10">
              <SectionColumn
                id="rightColumn"
                sectionIds={data.layout.rightColumn}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
              />
            </div>
          </div>
        </div>

        {/* KHO LƯU TRỮ SECTION */}
        <div className="bg-slate-900/5 border-2 border-dashed border-slate-200 rounded-3xl p-8 transition-all">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            Kho lưu trữ Section (Kéo vào để sử dụng)
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

// --- RENDER NỘI DUNG VỚI INLINE EDITOR ---
const SectionRenderer = ({ section }: { section: CvSection }) => {
  const { updateItemField, updateSectionTitle, addItem, removeItem } =
    useCvStore();
  const sType = section.type.toLowerCase();

  // Nút thêm Item chung
  const AddButton = () => (
    <button
      onClick={() => addItem(section.id)}
      className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-500/60 hover:text-blue-600 transition-all uppercase tracking-wider"
    >
      <Plus size={12} strokeWidth={3} /> Thêm {section.title}
    </button>
  );

  switch (sType) {
    case "header":
      const info = section.items[0] || { id: "header-default" };
      return (
        <div className="text-center space-y-3 mb-6">
          <InlineRichText
            value={info.title || ""}
            onChange={(val) =>
              updateItemField(section.id, info.id, "title", val)
            }
            className="text-4xl font-black text-slate-900 uppercase tracking-tighter"
            placeholder="HỌ TÊN CỦA BẠN"
          />
          <InlineRichText
            value={info.subtitle || ""}
            onChange={(val) =>
              updateItemField(section.id, info.id, "subtitle", val)
            }
            className="text-sm text-blue-600 font-bold uppercase tracking-[0.3em]"
            placeholder="VỊ TRÍ ỨNG TUYỂN"
          />
        </div>
      );

    case "experience":
    case "education":
    case "projects":
      return (
        <div className="space-y-6">
          <div className="border-b-2 border-slate-900 pb-1 flex justify-between items-end">
            <InlineRichText
              value={section.title}
              onChange={(val) => updateSectionTitle(section.id, val)}
              className="text-sm font-black text-slate-900 uppercase tracking-widest"
            />
          </div>
          {section.items.map((item) => (
            <div key={item.id} className="group/item relative space-y-1">
              <button
                onClick={() => removeItem(section.id, item.id)}
                className="absolute -left-6 top-1 opacity-0 group-hover/item:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={12} />
              </button>

              <div className="flex justify-between items-start">
                <InlineRichText
                  value={item.title || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "title", val)
                  }
                  className="font-bold text-[13px] text-slate-800 uppercase flex-1"
                  placeholder="Tiêu đề mục..."
                />
                <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px] shrink-0 mt-1">
                  <Calendar size={10} />
                  <InlineRichText
                    value={item.date || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "date", val)
                    }
                    className="text-right min-w-[80px]"
                    placeholder="2022 - Hiện tại"
                  />
                </div>
              </div>

              <InlineRichText
                value={item.subtitle || ""}
                onChange={(val) =>
                  updateItemField(section.id, item.id, "subtitle", val)
                }
                className="text-[11px] text-blue-600 font-bold italic -mt-1"
                placeholder="Tên tổ chức/Công ty..."
              />

              <InlineRichText
                value={item.description || ""}
                onChange={(val) =>
                  updateItemField(section.id, item.id, "description", val)
                }
                className="text-[11px] text-slate-600 leading-relaxed text-justify mt-1"
                placeholder="Mô tả chi tiết thành tựu của bạn (aaaaaaaaaaaaa)..."
              />
            </div>
          ))}
          <AddButton />
        </div>
      );

    case "skills":
      return (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-1">
            <InlineRichText
              value={section.title}
              onChange={(val) => updateSectionTitle(section.id, val)}
              className="text-[11px] font-black text-slate-800 uppercase tracking-widest"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {section.items.map((s) => (
              <div key={s.id} className="group/skill relative">
                <InlineRichText
                  value={s.title || ""}
                  onChange={(val) =>
                    updateItemField(section.id, s.id, "title", val)
                  }
                  className="px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-bold hover:border-blue-300 transition-colors"
                  placeholder="Kỹ năng"
                />
              </div>
            ))}
            <button
              onClick={() => addItem(section.id)}
              className="p-1 text-blue-400 hover:text-blue-600"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

// --- COMPONENT HỖ TRỢ DND ---
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
            "flex min-h-[40px] transition-all duration-300",
            isHorizontal
              ? "flex-row flex-wrap gap-3 p-4 bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl"
              : "flex-col gap-6",
            snapshot.isDraggingOver &&
              "bg-blue-50/30 ring-2 ring-blue-200/50 ring-dashed rounded-xl",
          )}
        >
          {sectionIds.map((sid, index) => {
            const section = getSection(sid);
            if (!section) return null;

            return (
              <Draggable key={sid} draggableId={sid} index={index}>
                {(p, s) => (
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    className={cn(
                      "group relative bg-white transition-all",
                      s.isDragging
                        ? "shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] ring-2 ring-blue-500/50 scale-[1.02] z-50 rounded-xl p-4"
                        : "hover:ring-1 hover:ring-slate-100 rounded-lg",
                      !section.visible &&
                        id !== "unused" &&
                        "opacity-30 grayscale blur-[1px]",
                      id === "unused" &&
                        "border border-slate-200 p-4 rounded-xl w-48 shadow-sm h-fit bg-white/80",
                    )}
                  >
                    {/* Toolbar điều khiển Section */}
                    <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-[60]">
                      <div
                        {...p.dragHandleProps}
                        className="p-1.5 bg-white shadow-xl border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(sid)}
                        className={cn(
                          "p-1.5 bg-white shadow-xl border border-slate-100 rounded-lg transition-colors",
                          section.visible
                            ? "text-slate-400 hover:text-red-500"
                            : "text-blue-500 hover:text-blue-600",
                        )}
                      >
                        {section.visible ? (
                          <EyeOff size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                    </div>

                    {id === "unused" ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                          <Plus size={20} />
                        </div>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest text-center">
                          {section.title}
                        </span>
                      </div>
                    ) : (
                      <SectionRenderer section={section} />
                    )}
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
