import React, { useState } from "react";
import {
  Loader2,
  Check,
  ArrowLeft,
  Printer,
  LayoutTemplate,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCvStore } from "@/stores/useCvStore";

// Import trực tiếp file ngôn ngữ
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

const TEMPLATES = [
  { id: "standard-01", label: { vi: "Mẫu Tiêu chuẩn", en: "Standard" } },
  { id: "harvard-01", label: { vi: "Mẫu Harvard", en: "Harvard" } },
  { id: "modern-01", label: { vi: "Mẫu Hiện đại", en: "Modern" } },
];

/**
 * HELPER: Loại bỏ thẻ HTML để dữ liệu gửi lên Rust Backend sạch sẽ
 */
const stripHtml = (text: string): string => {
  if (!text) return "";
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
};

const EditorToolbar = ({ isSaving }: { isSaving: boolean }) => {
  // Bổ sung setLanguage từ Store
  const { data, updateTheme, name, updateCvName, saveChanges, setLanguage } =
    useCvStore();
  const [isPrinting, setIsPrinting] = useState(false);

  if (!data) return null;

  // Logic chọn bộ từ điển dựa trên language trong store
  const currentLang = data.language || "vi";
  const t = currentLang === "en" ? en : vi;

  const handleExportPdf = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center px-6 sticky top-0 z-[100] shadow-sm print:hidden">
      {/* CÁNH TRÁI: Điều hướng, Template & NGÔN NGỮ */}
      <div className="flex items-center gap-4 flex-1">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors group shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden lg:inline font-bold">
            {t.common?.dashboard || "Dashboard"}
          </span>
        </Link>

        <div className="w-px h-6 bg-slate-200 shrink-0" />

        {/* Bộ chọn Template */}
        <div className="flex items-center gap-2 shrink-0">
          <LayoutTemplate className="w-4 h-4 text-indigo-500" />
          <select
            value={data.theme.templateId || "standard-01"}
            onChange={(e) => updateTheme({ templateId: e.target.value })}
            className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md px-2 py-1.5 font-black outline-none hover:bg-indigo-100 transition-all cursor-pointer uppercase tracking-tight"
          >
            {TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.label[currentLang as "vi" | "en"]}
              </option>
            ))}
          </select>
        </div>

        {/* THANH CHUYỂN ĐỔI NGÔN NGỮ (BỔ SUNG) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2 shadow-sm">
          <button
            onClick={() => setLanguage("vi")}
            className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
              currentLang === "vi"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            VI
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
              currentLang === "en"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* TRUNG TÂM: Tên CV */}
      <div className="flex-[1.5] flex justify-center px-4">
        <div className="flex flex-col items-center max-w-[300px] w-full">
          <input
            type="text"
            value={name || ""}
            onChange={(e) => updateCvName(e.target.value)}
            onBlur={() => {
              const cleanName = stripHtml(name);
              updateCvName(cleanName);
              saveChanges();
            }}
            className="w-full text-center text-sm font-bold text-slate-700 px-3 py-1
                       bg-slate-50/50 rounded-md border border-transparent
                       focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50
                       hover:bg-slate-100 transition-all outline-none truncate"
            placeholder="Nhập tên CV..."
          />
        </div>
      </div>

      {/* CÁNH PHẢI: Trạng thái & Xuất PDF */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className="flex items-center shrink-0">
          {isSaving ? (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="uppercase tracking-wider">
                {t.common?.syncing || "Syncing..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
              <Check className="w-3 h-3" />
              <span className="uppercase tracking-wider">
                {t.common?.synced || "Synced"}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleExportPdf}
          disabled={isSaving || isPrinting}
          variant="outline"
          size="sm"
          className="gap-2 h-9 px-4 font-black border-slate-200 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 transition-all shadow-sm"
        >
          {isPrinting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          ) : (
            <Printer className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="text-xs uppercase hidden sm:inline">
            {isPrinting ? "Exporting..." : t.common?.export_pdf || "Export PDF"}
          </span>
        </Button>
      </div>
    </header>
  );
};

export default EditorToolbar;
