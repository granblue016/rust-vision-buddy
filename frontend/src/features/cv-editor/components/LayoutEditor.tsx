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
  Eye,
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
    return data?.sections.find((s) => s.id === id);
  };

  if (!data) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-12 p-8 max-w-[1000px] mx-auto pb-32">
        {/* Tờ giấy A4 Preview Editor */}
        <div className="bg-white border border-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.1)] min-h-[1123px] relative transition-all overflow-hidden font-sans rounded-sm">
          {/* Watermark */}
          <div className="absolute top-4 right-6 text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] select-none">
            A4 Canvas Editor
          </div>

          {/* Vùng Header (Full Width) */}
          <div className="p-12 pb-6">
            <SectionColumn
              id="fullWidth"
              sectionIds={data.layout.fullWidth}
              getSection={getSectionById}
              toggleVisibility={toggleSectionVisibility}
            />
          </div>

          {/* Nội dung chính 2 cột */}
          <div className="grid grid-cols-12 gap-0 px-12 pb-12">
            {/* Cột Trái */}
            <div className="col-span-4 border-r border-slate-100 pr-8 min-h-[600px]">
              <SectionColumn
                id="leftColumn"
                sectionIds={data.layout.leftColumn}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
              />
            </div>

            {/* Cột Phải */}
            <div className="col-span-8 pl-10 space-y-10 min-h-[600px]">
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
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
              <Layout size={14} className="text-indigo-500" />
              Thành phần lưu trữ
            </h3>
            <span className="text-[10px] text-slate-400 font-medium italic">
              Kéo thả vào bản in để sử dụng
            </span>
          </div>
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
    data, // Lấy data từ store để truyền vào HeaderBlock
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
      className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-all uppercase tracking-wider group-hover:opacity-100 opacity-0"
    >
      <Plus size={12} strokeWidth={3} /> Thêm {section.title}
    </button>
  );

  switch (sType) {
    case "header":
      // CẬP NHẬT: Truyền props để HeaderBlock hoạt động chính xác trong Editor
      return (
        <HeaderBlock
          personalInfo={data?.personalInfo}
          theme={data?.theme}
          isPreview={false}
        />
      );

    case "summary":
      return (
        <div className="group">
          <SectionTitle />
          <InlineRichText
            value={section.content || ""}
            onChange={(val) => updateSectionContent(section.id, val)}
            className="text-[11px] text-slate-600 leading-relaxed text-justify"
            placeholder="Viết lời giới thiệu bản thân..."
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
                    className="font-bold text-[12px] text-slate-800 uppercase flex-1"
                    placeholder="Tên vị trí"
                  />
                  <div className="flex items-center gap-1 text-slate-400 font-medium text-[10px] shrink-0 mt-0.5">
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
                  className="text-[11px] text-indigo-600 font-bold"
                  placeholder="Tên tổ chức/Công ty"
                />

                <InlineRichText
                  value={item.description || ""}
                  onChange={(v) =>
                    updateItemField(section.id, item.id, "description", v)
                  }
                  className="text-[11px] text-slate-600 leading-relaxed text-justify mt-1"
                  placeholder="Mô tả chi tiết..."
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
                  className="px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-bold hover:border-indigo-400 transition-colors"
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
              className="p-1 text-indigo-400 hover:scale-110 group-hover:opacity-100 opacity-0 transition-all"
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
            "flex transition-all duration-300 rounded-xl",
            isHorizontal
              ? "flex-row flex-wrap gap-4 min-h-[120px] items-center justify-start"
              : "flex-col gap-10 min-h-[100px]",
            snapshot.isDraggingOver &&
              "bg-indigo-50/40 ring-2 ring-indigo-200 ring-dashed p-4 shadow-inner",
            !snapshot.isDraggingOver && id !== "unused" && "py-2",
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
                        ? "shadow-2xl ring-2 ring-indigo-500 scale-[1.05] z-[100] rounded-lg p-4"
                        : "hover:outline hover:outline-1 hover:outline-indigo-100 hover:rounded-sm",
                      !section.visible &&
                        id !== "unused" &&
                        "opacity-30 grayscale blur-[0.5px]",
                      id === "unused" &&
                        "border border-slate-200 p-4 rounded-xl w-44 bg-white shadow-sm flex flex-col items-center justify-center hover:border-indigo-300 hover:shadow-md transition-all active:scale-95",
                    )}
                  >
                    {/* Controls (Grip & Toggle) */}
                    <div
                      className={cn(
                        "absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-[110]",
                        s.isDragging && "opacity-0",
                      )}
                    >
                      <div
                        {...p.dragHandleProps}
                        className="p-1.5 bg-white shadow-md border border-slate-100 rounded-md text-slate-400 hover:text-indigo-600 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical size={14} />
                      </div>
                      <button
                        onClick={() => toggleVisibility(sid)}
                        className="p-1.5 bg-white shadow-md border border-slate-100 rounded-md text-slate-400 hover:text-indigo-600"
                      >
                        {section.visible ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>

                    {id === "unused" ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                          <Plus size={14} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">
                          {section.title}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <SectionRenderer section={section} />
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}

          {sectionIds.length === 0 && !snapshot.isDraggingOver && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg py-8">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Kéo nội dung vào đây
              </span>
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default LayoutEditor;
