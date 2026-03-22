import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Eye, EyeOff, FileText, User, Target, GraduationCap, Briefcase, Wrench } from "lucide-react";
import { useCvStore } from "@/stores/useCvStore";

const sectionIcons: Record<string, React.ElementType> = {
  header: User,
  summary: Target,
  education: GraduationCap,
  experience: Briefcase,
  skills: Wrench,
};

const LayoutSidebar = () => {
  const { data, reorderSections, toggleSectionVisibility } = useCvStore();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderSections(result.source.index, result.destination.index);
  };

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          <h2 className="font-display font-semibold text-sm tracking-wide uppercase text-foreground">
            Bố cục
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Kéo thả để sắp xếp thứ tự</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 overflow-y-auto p-3 space-y-1.5"
            >
              {data.sections.map((section, index) => {
                const Icon = sectionIcons[section.type] || FileText;
                return (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          group flex items-center gap-2 rounded-lg px-3 py-2.5
                          border transition-all duration-200
                          ${snapshot.isDragging
                            ? "border-accent bg-accent/5 shadow-elevated scale-[1.02]"
                            : "border-transparent hover:border-border hover:bg-muted/50"
                          }
                          ${!section.visible ? "opacity-50" : ""}
                        `}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <Icon className="w-4 h-4 text-accent shrink-0" />
                        <span className="flex-1 text-sm font-medium text-foreground truncate">
                          {section.title}
                        </span>
                        <button
                          onClick={() => toggleSectionVisibility(section.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </aside>
  );
};

export default LayoutSidebar;
