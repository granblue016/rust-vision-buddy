import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCvStore } from "@/stores/useCvStore";
// FIX: Import trực tiếp hằng số từ file types, không lấy qua useCvStore()
import { DEFAULT_CV_DATA } from "@/types/cv";
import LayoutEditor from "../components/LayoutEditor";
import EditorToolbar from "../components/EditorToolbar";
import LayoutSidebar from "../components/LayoutSidebar";
import { Loader2, AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "@/styles/editor.css";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // FIX: Chỉ lấy các state và actions thực sự tồn tại trong CvStoreState
  const {
    fetchCv,
    isLoading,
    error,
    data,
    saveChanges,
    isSaving,
    setInitialData,
  } = useCvStore();

  // 1. Khởi tạo dữ liệu từ Backend dựa trên UUID từ URL
  useEffect(() => {
    if (id) {
      fetchCv(id);
    }
  }, [id, fetchCv]);

  // 2. Trạng thái Loading
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-slate-50/50">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-slate-600 font-bold tracking-tight">
            Đang tải dữ liệu CV...
          </p>
          <p className="text-xs text-slate-400 italic">
            Vui lòng đợi giây lát, đang kết nối Rust Backend
          </p>
        </div>
      </div>
    );
  }

  // 3. Trạng thái Lỗi hoặc Dữ liệu trống
  if (error || !id || (data && data.sections.length === 0)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="bg-destructive/10 p-5 rounded-full mb-6 ring-8 ring-destructive/5">
          <AlertCircle className="w-14 h-14 text-destructive" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
          Hệ thống chưa có dữ liệu
        </h1>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          {error ||
            "Không tìm thấy nội dung CV cho ID này hoặc kết nối Port 9000 gặp sự cố."}
        </p>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="gap-2 border-slate-300 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
          </Button>

          {/* Cứu cánh: Khởi tạo dữ liệu mẫu nếu API rỗng sử dụng hằng số vừa import */}
          <Button
            onClick={() => setInitialData(DEFAULT_CV_DATA)}
            variant="default"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <RefreshCcw className="w-4 h-4" /> Khởi tạo bản thảo mới
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f4f7f6] selection:bg-indigo-100">
      {/* THANH CÔNG CỤ TRÊN CÙNG */}
      <header className="sticky top-0 z-50">
        <EditorToolbar
          // FIX: Sử dụng template_id vì object data không có trường 'name'
          cvName={data?.template_id || "Untitled Template"}
          onSave={saveChanges}
          isSaving={isSaving}
        />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR TRÁI */}
        <aside className="w-[320px] border-r border-slate-200 bg-white overflow-y-auto hidden xl:block shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
          <LayoutSidebar />
        </aside>

        {/* VÙNG TRUNG TÂM (CANVAS) */}
        <main className="flex-1 overflow-y-auto p-12 scrollbar-hide scroll-smooth">
          <div className="max-w-[820px] mx-auto transition-all duration-500 transform scale-[0.98] hover:scale-100 origin-top">
            <LayoutEditor />
          </div>
        </main>
      </div>

      {/* FOOTER TRẠNG THÁI */}
      <footer className="h-10 border-t border-slate-200 bg-white px-8 flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-mono bg-slate-100/80 px-2.5 py-1 rounded border border-slate-200 text-[10px] text-slate-600">
            <span className="text-slate-400">UUID:</span> {id}
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300 ring-4",
                isSaving
                  ? "bg-amber-400 animate-pulse ring-amber-100"
                  : "bg-emerald-500 ring-emerald-50",
              )}
            />
            <span
              className={cn(
                "transition-colors",
                isSaving ? "text-amber-600" : "text-emerald-600",
              )}
            >
              {isSaving
                ? "Đang đồng bộ với Rust..."
                : "Dữ liệu đã an toàn trên Cloud"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          <AlertCircle className="w-3.5 h-3.5" />
          Mẹo: Kéo thả các Section để thay đổi cấu trúc CV theo ý bạn.
        </div>
      </footer>
    </div>
  );
};

export default EditorPage;
