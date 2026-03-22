import { useEffect, useCallback, useRef, useMemo } from "react";
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
import EditableField from "@/components/cv/EditableField";
import EditorSidebar from "@/components/cv/EditorSidebar";
import EditableSection from "@/components/cv/EditableSection";

import { toast } from "sonner";
import { Loader2, Save, Mail, Phone, Layout, Download } from "lucide-react";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data,
    isSaving,
    setInitialData,
    reorderSections,
    updateItemField,
    setIsSaving,
    markSaved,
  } = useCvStore();

  // Cấu hình Sensors cho Drag and Drop (bỏ qua nếu click vào vùng input/textarea)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // 1. Load dữ liệu từ Backend Rust
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const cv = await cvService.getById(id);
        setInitialData(cv.layout_data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Không thể tải CV. Kiểm tra Backend Rust tại Port 9000");
      }
    };
    loadData();
  }, [id, setInitialData]);

  // 2. Logic Lưu dữ liệu (Auto & Manual)
  const handleSave = useCallback(async () => {
    if (!id || !data) return false;
    setIsSaving(true);
    try {
      await cvService.update(id, { layout_data: data });
      markSaved();
      return true;
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Lỗi khi lưu dữ liệu!");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [id, data, setIsSaving, markSaved]);

  // Auto-save sau 3 giây khi có thay đổi dữ liệu
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

  // 3. Xử lý Kéo thả
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data!.sections.findIndex((s) => s.id === active.id);
      const newIndex = data!.sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(oldIndex, newIndex);
      }
    }
  };

  // 4. Phân loại Section (Sử dụng useMemo để tránh tính toán lại vô ích)
  const { headerSection, sortableSections } = useMemo(() => {
    if (!data?.sections) return { headerSection: null, sortableSections: [] };
    return {
      headerSection: data.sections.find((s) => s.type === "header"),
      sortableSections: data.sections.filter((s) => s.type !== "header"),
    };
  }, [data?.sections]);

  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium animate-pulse text-lg">
          Đang kết nối với Backend Rust...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden text-slate-900">
      {/* Navbar điều hướng */}
      <header className="h-14 bg-white border-b px-6 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
            <Layout size={18} />
          </div>
          <h1 className="font-black text-slate-800 tracking-tight text-sm uppercase">
            Career Compass <span className="text-indigo-600">Studio</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              handleSave().then((ok) => ok && toast.success("Đã lưu thủ công!"))
            }
            disabled={isSaving}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full hover:bg-slate-800 transition-all text-xs font-bold disabled:opacity-50"
          >
            <Save size={14} /> {isSaving ? "Đang lưu..." : "Lưu thủ công"}
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-all text-xs font-bold shadow-lg">
            <Download size={14} /> Xuất PDF
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar công cụ */}
        <EditorSidebar />

        {/* Khu vực Review CV (Khổ A4) */}
        <section className="flex-1 overflow-y-auto p-12 flex justify-center bg-slate-200/40 custom-scrollbar">
          <div
            className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] border border-slate-200 relative transition-all"
            style={{ fontFamily: data.theme.font_family }}
          >
            {/* Header Section (Thông tin cá nhân) - Không cho phép kéo thả */}
            {headerSection && headerSection.visible && (
              <div
                className="mb-12 text-center border-b-4 pb-10"
                style={{ borderColor: data.theme.primary_color }}
              >
                {headerSection.items.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <EditableField
                      value={item.title}
                      onSave={(val) =>
                        updateItemField(headerSection.id, item.id, "title", val)
                      }
                      className="text-5xl font-black text-slate-900 uppercase tracking-tighter"
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
                      className="text-xl font-bold tracking-widest uppercase"
                      style={{ color: data.theme.primary_color }}
                      placeholder="VỊ TRÍ CÔNG VIỆC"
                    />
                    <div className="flex justify-center gap-8 mt-6 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <EditableField
                          value={item.email || "email@example.com"}
                          onSave={(val) =>
                            updateItemField(
                              headerSection.id,
                              item.id,
                              "email",
                              val,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <EditableField
                          value={item.phone || "0123.456.789"}
                          onSave={(val) =>
                            updateItemField(
                              headerSection.id,
                              item.id,
                              "phone",
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

            {/* Danh sách các Section có thể kéo thả (Kinh nghiệm, Học vấn...) */}
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
                    <EditableSection key={section.id} section={section} />
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
