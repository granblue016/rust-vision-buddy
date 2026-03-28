import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCvStore } from "@/stores/useCvStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import LayoutEditor from "../components/LayoutEditor";
import EditorToolbar from "../components/EditorToolbar";
import LayoutSidebar from "../components/LayoutSidebar";
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "@/styles/editor.css";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Lấy dữ liệu từ store
  const { fetchCv, isLoading, error, data, saveChanges, isSaving, lastSaved } =
    useCvStore();

  // Tăng thời gian delay auto-save lên 3s để ổn định
  useAutoSave(3000);

  useEffect(() => {
    if (id) {
      fetchCv(id);
    }
  }, [id, fetchCv]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-slate-50/50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-slate-600 font-bold">Đang kết nối Rust Backend...</p>
      </div>
    );
  }

  // Error Screen
  if (error || !id) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <AlertCircle className="w-14 h-14 text-destructive mb-6" />
        <h1 className="text-2xl font-black mb-3">Lỗi kết nối dữ liệu</h1>
        <p className="text-slate-500 mb-8">{error || "ID không hợp lệ"}</p>
        <Button onClick={() => navigate("/dashboard")} variant="outline">
          <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f4f7f6]">
      <header className="sticky top-0 z-50">
        {/* GIẢI PHÁP LỖI ts(2322): Xóa cvName.
          EditorToolbar hiện tại đã tự lấy 'name' từ useCvStore() bên trong nó.
        */}
        <EditorToolbar isSaving={isSaving} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[320px] border-r border-slate-200 bg-white overflow-y-auto hidden xl:block">
          <LayoutSidebar />
        </aside>

        <main className="flex-1 overflow-y-auto p-12 scrollbar-hide">
          <div className="max-w-[820px] mx-auto bg-white shadow-2xl min-h-[1123px]">
            {data ? (
              <LayoutEditor />
            ) : (
              <div className="p-20 text-center">
                Đang chuẩn bị khung soạn thảo...
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="h-10 border-t border-slate-200 bg-white px-8 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-8">
          <div className="bg-slate-100 px-2 py-1 rounded border text-slate-500">
            ID: {id.substring(0, 8)}...
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isSaving ? "bg-amber-400 animate-pulse" : "bg-emerald-500",
              )}
            />
            <span
              className={
                isSaving
                  ? "text-amber-600 font-medium"
                  : "text-emerald-600 font-medium"
              }
            >
              {isSaving ? (
                "Đang đồng bộ với Rust..."
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {lastSaved
                    ? `Đã lưu: ${lastSaved.toLocaleTimeString()}`
                    : "Dữ liệu đã khớp"}
                </span>
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EditorPage;
