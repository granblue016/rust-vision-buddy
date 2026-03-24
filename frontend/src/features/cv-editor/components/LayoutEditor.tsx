import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useCvStore } from "@/stores/useCvStore";
import { LayoutColumnId, CvSection } from "@/types/cv";
import {
  GripVertical,
  EyeOff,
  Plus,
  Calendar,
  Trash2,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineRichText } from "./InlineRichText";
import { HeaderBlock } from "./HeaderBlock";

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
      <div className="space-y-12 p-8 max-w-[1000px] mx-auto pb-32">
        {/* Tờ giấy A4 Preview */}
        <div className="bg-white border border-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.1)] min-h-[1123px] relative transition-all overflow-hidden font-sans">
          {/* Watermark ẩn khi in */}
          <div className="absolute top-4 right-6 text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] select-none print:hidden">
            A4 Canvas
          </div>

          {/* Vùng Header (Full Width) */}
          <div className="p-12 pb-0">
            <SectionColumn
              id="fullWidth"
              sectionIds={data.layout.fullWidth}
              getSection={getSectionById}
              toggleVisibility={toggleSectionVisibility}
            />
          </div>

          {/* Nội dung chính 2 cột */}
          <div className="grid grid-cols-12 gap-0 px-12 pb-12">
            {/* Cột Trái (Thường là mục phụ: Kỹ năng, Sở thích) */}
            <div className="col-span-4 border-r border-slate-100 pr-8 space-y-8 min-h-[800px]">
              <SectionColumn
                id="leftColumn"
                sectionIds={data.layout.leftColumn}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
              />
            </div>

            {/* Cột Phải (Thường là mục chính: Kinh nghiệm, Học vấn) */}
            <div className="col-span-8 pl-10 space-y-10">
              <SectionColumn
                id="rightColumn"
                sectionIds={data.layout.rightColumn}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
              />
            </div>
          </div>
        </div>

        {/* KHO LƯU TRỮ (Dành cho các mục chưa dùng) */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 transition-all">
          <h3 className="text-xs font-black text-slate-500 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <Layout size={14} className="text-blue-500" />
            Các thành phần chưa sử dụng
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

// --- RENDER NỘI DUNG ---
const SectionRenderer = ({ section }: { section: CvSection }) => {
  const {
    updateItemField,
    updateSectionTitle,
    addItem,
    removeItem,
    updateSectionContent,
  } = useCvStore();
  const sType = section.type.toLowerCase();

  const SectionTitle = () => (
    <div className="border-b-2 border-slate-900 pb-1 mb-4">
      <InlineRichText
        value={section.title}
        onChange={(val) => updateSectionTitle(section.id, val)}
        className="text-sm font-black text-slate-900 uppercase tracking-widest"
      />
    </div>
  );

  const AddButton = () => (
    <button
      onClick={() => addItem(section.id)}
      className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-500/60 hover:text-blue-600 transition-all uppercase tracking-wider group-hover:opacity-100 opacity-0"
    >
      <Plus size={12} strokeWidth={3} /> Thêm {section.title}
    </button>
  );

  switch (sType) {
    case "header":
      return <HeaderBlock />;

    case "summary":
      return (
        <div className="group">
          <SectionTitle />
          <InlineRichText
            value={section.content || ""}
            onChange={(val) => updateSectionContent(section.id, val)}
            className="text-[11px] text-slate-600 leading-relaxed text-justify"
            placeholder="Viết mục tiêu nghề nghiệp..."
          />
        </div>
      );

    case "experience":
    case "education":
    case "projects":
      return (
        <div className="group">
          <SectionTitle />
          <div className="space-y-6">
            {section.items.map((item) => (
              <div key={item.id} className="group/item relative space-y-1">
                <button
                  onClick={() => removeItem(section.id, item.id)}
                  className="absolute -left-8 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>

                <div className="flex justify-between items-start">
                  <InlineRichText
                    value={item.title || ""}
                    onChange={(v) =>
                      updateItemField(section.id, item.id, "title", v)
                    }
                    className="font-bold text-[13px] text-slate-800 uppercase flex-1"
                    placeholder="Tên vị trí/Ngành học"
                  />
                  <div className="flex items-center gap-1 text-slate-400 font-medium text-[10px] shrink-0 mt-1">
                    <Calendar size={10} />
                    <InlineRichText
                      value={item.date || ""}
                      onChange={(v) =>
                        updateItemField(section.id, item.id, "date", v)
                      }
                      className="text-right min-w-[70px]"
                      placeholder="Thời gian"
                    />
                  </div>
                </div>

                <InlineRichText
                  value={item.subtitle || ""}
                  onChange={(v) =>
                    updateItemField(section.id, item.id, "subtitle", v)
                  }
                  className="text-[11px] text-blue-600 font-bold italic"
                  placeholder="Tên công ty/Trường học"
                />

                <InlineRichText
                  value={item.description || ""}
                  onChange={(v) =>
                    updateItemField(section.id, item.id, "description", v)
                  }
                  className="text-[11px] text-slate-600 leading-relaxed text-justify mt-1"
                  placeholder="Mô tả công việc chi tiết..."
                />
              </div>
            ))}
          </div>
          <AddButton />
        </div>
      );

    case "skills":
      return (
        <div className="group">
          <SectionTitle />
          <div className="flex flex-wrap gap-2">
            {section.items.map((s) => (
              <div
                key={s.id}
                className="group/skill relative flex items-center"
              >
                <InlineRichText
                  value={s.title || ""}
                  onChange={(v) =>
                    updateItemField(section.id, s.id, "title", v)
                  }
                  className="px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-bold hover:border-blue-400 transition-colors"
                  placeholder="Skill"
                />
                <button
                  onClick={() => removeItem(section.id, s.id)}
                  className="ml-1 opacity-0 group-hover/skill:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addItem(section.id)}
              className="p-1 text-blue-400 hover:scale-110"
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

// --- DND COMPONENTS ---
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
            "flex transition-all duration-300",
            isHorizontal
              ? "flex-row flex-wrap gap-4 min-h-[100px]"
              : "flex-col gap-8 min-h-[40px]",
            snapshot.isDraggingOver &&
              "bg-blue-50/50 ring-2 ring-blue-200/50 ring-dashed rounded-xl p-4",
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
                      "group relative bg-white",
                      s.isDragging
                        ? "shadow-2xl ring-2 ring-blue-500 scale-[1.02] z-50 rounded-lg p-4"
                        : "hover:outline hover:outline-1 hover:outline-blue-100",
                      !section.visible &&
                        id !== "unused" &&
                        "opacity-30 grayscale",
                      id === "unused" &&
                        "border border-slate-200 p-4 rounded-xl w-40 bg-white shadow-sm flex flex-col items-center",
                    )}
                  >
                    {/* Controls (Grip & Toggle) */}
                    <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-[60]">
                      <div
                        {...p.dragHandleProps}
                        className="p-1.5 bg-white shadow-md border border-slate-100 rounded text-slate-400 hover:text-blue-600"
                      >
                        <GripVertical size={14} />
                      </div>
                      <button
                        onClick={() => toggleVisibility(sid)}
                        className="p-1.5 bg-white shadow-md border border-slate-100 rounded text-slate-400 hover:text-blue-600"
                      >
                        {section.visible ? (
                          <EyeOff size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>
                    </div>

                    {id === "unused" ? (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center">
                        {section.title}
                      </span>
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
