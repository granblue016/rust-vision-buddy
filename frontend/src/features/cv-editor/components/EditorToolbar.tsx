import React from "react";
import { Save, Loader2, Check, ArrowLeft, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCvStore } from "@/stores/useCvStore";
import { cn } from "@/lib/utils"; // Giải quyết lỗi Cannot find name 'cn'

// Danh sách các Template hỗ trợ đồng bộ với Backend
const TEMPLATES = [
  { id: "modern-01", label: "Modern" },
  { id: "classic-01", label: "Classic" },
  { id: "minimal-01", label: "Minimal" },
  { id: "creative-01", label: "Creative" },
];

/**
 * Định nghĩa Props nhận từ EditorPage
 */
interface EditorToolbarProps {
  cvName: string; // Nhận template_id từ EditorPage để hiển thị
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const EditorToolbar = ({ cvName, onSave, isSaving }: EditorToolbarProps) => {
  // Lấy dữ liệu và các actions từ Zustand Store
  const { data, updateTheme, updateCvField } = useCvStore();

  /**
   * Xử lý thay đổi Template: Cập nhật cả trường bên ngoài và bên trong Theme
   * để đảm bảo tính nhất quán dữ liệu khi gửi lên Rust
   */
  const handleTemplateChange = (templateId: string) => {
    // 1. Cập nhật template_id của CvLayoutData
    updateCvField("template_id", templateId);

    // 2. Đồng bộ template_id bên trong CvTheme để UI render đúng
    updateTheme({ template_id: templateId });
  };

  // Tránh lỗi khi data chưa kịp load
  if (!data) return null;

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-[100] shadow-sm">
      {/* Nút quay lại Dashboard */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mr-2 group"
      >
        <div className="p-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="hidden sm:inline font-bold">Dashboard</span>
      </Link>

      <div className="w-px h-6 bg-slate-200" />

      {/* Hiển thị tên CV/Template */}
      <div
        className={cn("items-center gap-3 max-w-[240px] hidden md:flex ml-2")}
      >
        <div className="bg-indigo-50 p-1.5 rounded text-indigo-600">
          <Palette className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
            Template đang dùng
          </span>
          <span className="text-sm font-bold truncate text-slate-800">
            {cvName}
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-slate-200 hidden md:block" />

      {/* Bộ chọn Template */}
      <div className="flex items-center gap-3 ml-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Giao diện
        </label>
        <select
          value={data.template_id || "modern-01"}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:bg-slate-100 shadow-sm"
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Picker: Chỉnh sửa mã màu chủ đạo của CV */}
      <div className="flex items-center gap-4 ml-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Màu chủ đạo
        </label>
        <div className="flex items-center gap-2.5 bg-slate-50 p-1 pr-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm group">
          <div className="relative w-7 h-7 shrink-0">
            <input
              type="color"
              value={data.theme.primary_color}
              onChange={(e) => updateTheme({ primary_color: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="w-full h-full rounded-lg border-2 border-white shadow-inner transition-transform group-hover:scale-90"
              style={{ backgroundColor: data.theme.primary_color }}
            />
          </div>
          <span className="text-[11px] text-slate-700 font-mono font-black uppercase">
            {data.theme.primary_color}
          </span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Trạng thái và Nút Lưu */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          {isSaving ? (
            <span className="flex items-center gap-2 text-xs text-amber-600 font-bold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Đang đồng bộ Rust...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
              <Check className="w-3.5 h-3.5" />
              ĐÃ LƯU VÀO DATABASE
            </span>
          )}
        </div>

        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className={cn(
            "gap-2 px-5 py-2 h-10 font-black transition-all active:scale-95 shadow-lg",
            isSaving
              ? "bg-slate-100 text-slate-400"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
          )}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? "ĐANG XỬ LÝ..." : "LƯU THAY ĐỔI"}</span>
        </Button>
      </div>
    </header>
  );
};

export default EditorToolbar;
