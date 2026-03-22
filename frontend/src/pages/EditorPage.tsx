import { useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCvStore } from "@/stores/useCvStore";
import { cvService } from "@/services/cvService";
import SortableSection from "@/components/cv/SortableSection";
import EditableField from "@/components/cv/EditableField";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Sửa lỗi: Cannot find name 'cn'
import {
  Loader2,
  Save,
  Palette,
  Eye,
  EyeOff, // Sửa lỗi: Cannot find name 'EyeOff'
  Mail,
  Phone,
  Layout,
} from "lucide-react";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data,
    isSaving,
    setInitialData,
    reorderSections,
    toggleSectionVisibility,
    updateItemField,
    addItem,
    setIsSaving,
    markSaved,
    updateTheme,
  } = useCvStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // 1. Load dữ liệu ban đầu
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const cv = await cvService.getById(id);
        setInitialData(cv.layout_data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(
          "Không thể tải CV. Vui lòng kiểm tra Backend Rust (Port 9000)",
        );
      }
    };
    loadData();
  }, [id, setInitialData]);

  // 2. Hàm Lưu dữ liệu
  const handleSave = useCallback(async () => {
    if (!id || !data) return false;
    setIsSaving(true);
    try {
      await cvService.update(id, {
        name: "Career Compass CV",
        layout_data: data,
      });
      markSaved();
      return true;
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Lỗi đồng bộ dữ liệu với máy chủ.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [id, data, setIsSaving, markSaved]);

  // 3. Cơ chế Auto-save
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    if (data) {
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 3000);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, handleSave]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.sections.findIndex((s) => s.id === active.id);
      const newIndex = data.sections.findIndex((s) => s.id === over.id);
      reorderSections(oldIndex, newIndex);
    }
  };

  // Kiểm tra data trước khi render nội dung chính
  if (!data || !data.sections) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 animate-pulse font-medium">
          Đang tải bản thiết kế...
        </p>
      </div>
    );
  }

  const headerSection = data.sections.find((s) => s.type === "header");
  const sortableSections = data.sections.filter((s) => s.type !== "header");

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden text-slate-900">
      {/* Header Bar */}
      <header className="h-16 bg-white border-b px-6 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-indigo-200 shadow-lg">
            <Layout size={18} />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">
            Career Compass <span className="text-indigo-600">Editor</span>
          </span>
          {isSaving && (
            <span className="text-[10px] text-slate-400 ml-4 italic flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" /> Đang tự động lưu...
            </span>
          )}
        </div>

        <button
          onClick={() => {
            handleSave().then(
              (success) => success && toast.success("Đã lưu thành công!"),
            );
          }}
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-black transition-all disabled:opacity-50 text-sm font-medium shadow-md"
        >
          <Save size={14} /> Lưu ngay
        </button>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col shadow-inner overflow-y-auto">
          <div className="p-6 space-y-8">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Palette size={12} /> Màu sắc chủ đạo
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {["#2563eb", "#10b981", "#ef4444", "#0f172a", "#7c3aed"].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => updateTheme({ primary_color: color })}
                      className={cn(
                        "size-7 rounded-full transition-transform hover:scale-110 border-2",
                        data.theme.primary_color === color
                          ? "border-slate-900 scale-110 shadow-sm"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ),
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Cấu trúc các mục
              </h4>
              <div className="space-y-1">
                {data.sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSectionVisibility(s.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md text-xs transition-colors",
                      s.visible
                        ? "text-slate-700 hover:bg-slate-100 font-medium"
                        : "text-slate-300 bg-slate-50/50 italic",
                    )}
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    {s.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CV Canvas */}
        <section className="flex-1 overflow-y-auto p-8 flex justify-center scroll-smooth bg-slate-200/50 shadow-inner">
          <div
            className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] border border-slate-300 relative transition-all duration-500"
            style={{ fontFamily: data.theme.font_family }}
          >
            {/* Header Section */}
            {headerSection && headerSection.visible && (
              <div
                className="mb-10 text-center border-b-4 pb-8"
                style={{ borderColor: data.theme.primary_color }}
              >
                {headerSection.items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <EditableField
                      value={item.title}
                      onSave={(val) =>
                        updateItemField(headerSection.id, item.id, "title", val)
                      }
                      className="text-4xl font-black text-slate-900 uppercase tracking-tight"
                      placeholder="HỌ VÀ TÊN"
                    />
                    <EditableField
                      value={item.subtitle || ""}
                      onSave={(val) =>
                        updateItemField(
                          headerSection.id,
                          item.id,
                          "subtitle",
                          val,
                        )
                      }
                      className="text-lg font-bold"
                      style={{ color: data.theme.primary_color }}
                      placeholder="VỊ TRÍ CÔNG VIỆC"
                    />
                    <div className="flex justify-center gap-6 mt-4 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-400" />
                        <EditableField
                          value={item.description || "email@example.com"}
                          onSave={(val) =>
                            updateItemField(
                              headerSection.id,
                              item.id,
                              "description",
                              val,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400" />
                        <EditableField
                          value={item.date || "0123.456.789"}
                          onSave={(val) =>
                            updateItemField(
                              headerSection.id,
                              item.id,
                              "date",
                              val,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Draggable Sections */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-10">
                  {sortableSections.map((section) => (
                    <SortableSection
                      key={section.id}
                      id={section.id}
                      title={section.title}
                      isVisible={section.visible}
                      onToggleVisibility={() =>
                        toggleSectionVisibility(section.id)
                      }
                    >
                      <div className="space-y-6">
                        {section.items.map((item) => (
                          <div key={item.id} className="group/item relative">
                            <div className="flex justify-between items-start">
                              <EditableField
                                value={item.title}
                                onSave={(val) =>
                                  updateItemField(
                                    section.id,
                                    item.id,
                                    "title",
                                    val,
                                  )
                                }
                                className="font-bold text-lg text-slate-800 w-full"
                              />
                              <EditableField
                                value={item.date || ""}
                                onSave={(val) =>
                                  updateItemField(
                                    section.id,
                                    item.id,
                                    "date",
                                    val,
                                  )
                                }
                                className="text-xs text-slate-400 font-bold whitespace-nowrap ml-4 italic"
                              />
                            </div>
                            <EditableField
                              value={item.subtitle || ""}
                              onSave={(val) =>
                                updateItemField(
                                  section.id,
                                  item.id,
                                  "subtitle",
                                  val,
                                )
                              }
                              className="text-sm font-semibold block"
                              style={{ color: data.theme.primary_color }}
                            />
                            <EditableField
                              value={item.description || ""}
                              isTextArea
                              onSave={(val) =>
                                updateItemField(
                                  section.id,
                                  item.id,
                                  "description",
                                  val,
                                )
                              }
                              className="text-slate-600 text-sm mt-2 leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addItem(section.id, section.type)}
                        className="mt-4 opacity-0 group-hover/section:opacity-100 transition-all text-[10px] font-black text-indigo-600 uppercase tracking-wider hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200"
                      >
                        + Thêm nội dung
                      </button>
                    </SortableSection>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditorPage;
