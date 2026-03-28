import React, { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useCvStore } from "@/stores/useCvStore";
import { LayoutColumnId, CvSection } from "@/types/cv";
import { GripVertical, EyeOff, Layout, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineRichText } from "./InlineRichText";

// Import Blocks
import { HeaderBlock } from "./HeaderBlock";
import { EducationBlock } from "./EducationBlock";
import { ExperienceBlock } from "./ExperienceBlock";
import { ProjectsBlock } from "./ProjectsBlock";
import { SkillsBlock } from "./SkillsBlock";

// --- HELPERS ---
const getTemplateType = (id: string) => ({
  isHarvard: id.toLowerCase().includes("harvard"),
  isModern: id.toLowerCase().includes("modern"),
  isStandard: id.toLowerCase().includes("standard"),
});

const LayoutEditor = () => {
  const { data, moveSection, toggleSectionVisibility } = useCvStore();

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;

    moveSection(
      draggableId,
      source.droppableId as LayoutColumnId,
      destination.droppableId as LayoutColumnId,
      destination.index,
    );
  };

  const getSectionById = (id: string) =>
    data?.sections.find((s) => s.id === id);

  if (!data) return null;

  const templateId = data.theme.templateId || "standard-01";
  const { isHarvard, isModern, isStandard } = useMemo(
    () => getTemplateType(templateId),
    [templateId],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-12 p-8 max-w-[1100px] mx-auto pb-32 select-none">
        {/* TỜ GIẤY A4 CANVAS - ĐÃ THÊM ID VÀ ÉP MÀU IN */}
        <div
          id="cv-print-area"
          className={cn(
            "bg-white border border-slate-200 shadow-2xl min-h-[297mm] relative transition-all duration-500 overflow-hidden mx-auto print:shadow-none print:border-none print:m-0",
            isHarvard ? "font-serif" : "font-sans",
          )}
          style={{
            width: "210mm",
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        >
          {/* 1. VÙNG HEADER (FULL WIDTH) */}
          <div
            className={cn(
              "transition-colors duration-500",
              isModern
                ? "bg-slate-50/80 border-b border-slate-100 p-12 pb-8"
                : "p-12 pb-6",
            )}
          >
            <SectionColumn
              id="fullWidth"
              sectionIds={data.layout.fullWidth || []}
              getSection={getSectionById}
              toggleVisibility={toggleSectionVisibility}
              templateId={templateId}
            />
          </div>

          {/* 2. VÙNG NỘI DUNG CHÍNH */}
          <div
            className={cn(
              "grid gap-0 px-12 pb-12 transition-all duration-500",
              isHarvard ? "grid-cols-1" : "grid-cols-12",
            )}
          >
            {/* CỘT TRÁI (LEFT) */}
            <div
              className={cn(
                "transition-all duration-500",
                isHarvard && "col-span-1",
                isStandard &&
                  "col-span-4 border-r border-slate-100 pr-8 min-h-[400px]",
                isModern && "col-span-8 pr-10 min-h-[400px]",
              )}
            >
              <SectionColumn
                id="leftColumn"
                sectionIds={data.layout.leftColumn || []}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
                templateId={templateId}
              />
            </div>

            {/* CỘT PHẢI (RIGHT) */}
            <div
              className={cn(
                "transition-all duration-500",
                isHarvard && "col-span-1 mt-6",
                isStandard && "col-span-8 pl-10 space-y-10 min-h-[400px]",
                isModern &&
                  "col-span-4 border-l border-slate-50 pl-8 space-y-8 min-h-[400px]",
              )}
            >
              <SectionColumn
                id="rightColumn"
                sectionIds={data.layout.rightColumn || []}
                getSection={getSectionById}
                toggleVisibility={toggleSectionVisibility}
                templateId={templateId}
              />
            </div>
          </div>

          {/* DẢI TRANG TRÍ FOOTER (CHỈ CHO MODERN/STANDARD) */}
          {!isHarvard && (
            <div
              className="absolute bottom-0 left-0 w-full h-2 transition-colors duration-500"
              style={{ backgroundColor: data.theme.primaryColor || "#3b82f6" }}
            />
          )}
        </div>

        {/* KHO LƯU TRỮ (UNUSED) - ĐÃ THÊM print:hidden */}
        <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 print:hidden">
          <div className="flex items-center gap-3 mb-6 opacity-50">
            <Layout size={16} />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">
              Thành phần chưa dùng
            </h3>
          </div>
          <SectionColumn
            id="unused"
            sectionIds={data.layout.unused || []}
            getSection={getSectionById}
            toggleVisibility={toggleSectionVisibility}
            templateId={templateId}
            isHorizontal
          />
        </div>
      </div>
    </DragDropContext>
  );
};

// --- RENDERER PHÂN TÁCH LOGIC ---
const SectionRenderer = ({
  section,
  templateId,
}: {
  section: CvSection;
  templateId: string;
}) => {
  const { data, updateSectionTitle, updateSectionContent } = useCvStore();
  const { isHarvard, isModern } = getTemplateType(templateId);
  const primaryColor = data?.theme.primaryColor || "#3b82f6";

  const SectionHeader = () => (
    <div
      className={cn(
        "mb-4 transition-all duration-300",
        isHarvard ? "border-b border-slate-900 pb-0.5" : "border-b-2 pb-1",
      )}
      style={{ borderColor: isHarvard ? "#000" : primaryColor }}
    >
      <InlineRichText
        value={section.title}
        onChange={(val) => updateSectionTitle(section.id, val)}
        className={cn(
          "font-bold uppercase tracking-wider",
          isHarvard ? "text-[14px] text-black" : "text-[13px]",
        )}
        style={{
          color: isHarvard ? "#000" : isModern ? primaryColor : "#1e293b",
        }}
      />
    </div>
  );

  const blockProps = {
    section,
    templateId,
    primaryColor,
    isPreview: false,
  };

  switch (section.type.toLowerCase()) {
    case "header":
      return (
        <HeaderBlock
          personalInfo={data?.personalInfo}
          theme={data?.theme}
          isPreview={false}
          templateId={templateId}
        />
      );
    case "summary":
      return (
        <div className="group/section">
          <SectionHeader />
          <InlineRichText
            value={section.content || ""}
            onChange={(val) => updateSectionContent(section.id, val)}
            className={cn(
              "leading-relaxed text-justify",
              isHarvard ? "text-[13px]" : "text-[12px] text-slate-600",
            )}
          />
        </div>
      );
    case "experience":
      return <ExperienceBlock {...blockProps} />;
    case "education":
      return <EducationBlock {...blockProps} />;
    case "projects":
      return <ProjectsBlock {...blockProps} />;
    case "skills":
      return <SkillsBlock {...blockProps} />;
    default:
      return null;
  }
};

// --- COMPONENT DND NỘI BỘ ---
const SectionColumn = ({
  id,
  sectionIds,
  getSection,
  toggleVisibility,
  templateId,
  isHorizontal,
}: any) => {
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
              : "flex-col gap-8 min-h-[50px]",
            snapshot.isDraggingOver &&
              "bg-slate-50/50 ring-2 ring-indigo-100 ring-dashed p-4 rounded-xl",
          )}
        >
          {sectionIds.map((sid: string, index: number) => {
            const section = getSection(sid);
            if (!section) return null;

            return (
              <Draggable key={sid} draggableId={sid} index={index}>
                {(p, s) => (
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    className={cn(
                      "group relative bg-white transition-shadow",
                      s.isDragging &&
                        "shadow-2xl ring-2 ring-primary z-50 p-4 rounded-lg",
                      !section.visible &&
                        id !== "unused" &&
                        "opacity-25 grayscale hover:opacity-100",
                      id === "unused" &&
                        "border border-slate-200 p-4 rounded-xl w-44 bg-white shadow-sm flex items-center justify-center text-center",
                    )}
                  >
                    {/* NÚT ĐIỀU KHIỂN - Đã có print:hidden ở phiên bản trước */}
                    <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-[60] print:hidden">
                      <div
                        {...p.dragHandleProps}
                        className="p-1.5 bg-white shadow-md border rounded-md cursor-grab active:cursor-grabbing text-slate-400 hover:text-primary"
                      >
                        <GripVertical size={14} />
                      </div>
                      <button
                        onClick={() => toggleVisibility(sid)}
                        className="p-1.5 bg-white shadow-md border rounded-md text-slate-400 hover:text-primary"
                      >
                        {section.visible ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>

                    {id === "unused" ? (
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        {section.title}
                      </span>
                    ) : (
                      <SectionRenderer
                        section={section}
                        templateId={templateId}
                      />
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
