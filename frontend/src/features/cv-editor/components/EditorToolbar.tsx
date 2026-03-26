import React from "react";
import {
  Save,
  Loader2,
  Check,
  ArrowLeft,
  Type,
  Baseline,
  Printer,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCvStore } from "@/stores/useCvStore";
import { cn } from "@/lib/utils";

// Import file ngôn ngữ
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

const FONTS = [
  { id: "font-inter", label: "Inter", value: "'Inter', sans-serif" },
  { id: "font-roboto", label: "Roboto", value: "'Roboto', sans-serif" },
  {
    id: "font-montserrat",
    label: "Montserrat",
    value: "'Montserrat', sans-serif",
  },
];

const EditorToolbar = ({
  cvName,
  onSave,
  isSaving,
}: {
  cvName: string;
  onSave: () => Promise<void>;
  isSaving: boolean;
}) => {
  // Lấy data, actions và đặc biệt là setLanguage từ store
  const { data, updateTheme, exportPdf, setLanguage } = useCvStore();

  if (!data) return null;

  // Xác định bộ từ điển dựa trên language trong store
  const t = data.language === "en" ? en : vi;

  const FONT_SIZES = [
    {
      id: "size-sm",
      label: data.language === "en" ? "Small" : "Nhỏ",
      value: "12px",
    },
    {
      id: "size-md",
      label: data.language === "en" ? "Medium" : "Vừa",
      value: "14px",
    },
    {
      id: "size-lg",
      label: data.language === "en" ? "Large" : "Lớn",
      value: "16px",
    },
  ];

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-[100] shadow-sm">
      {/* Nút quay lại */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mr-2 group shrink-0"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline font-bold">{t.common.dashboard}</span>
      </Link>

      <div className="w-px h-6 bg-slate-200 shrink-0" />

      {/* Chọn Font */}
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Type className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={data.theme.fontFamily || "'Inter', sans-serif"}
          onChange={(e) => updateTheme({ fontFamily: e.target.value })}
          className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 font-bold outline-none hover:bg-slate-100 transition-all cursor-pointer"
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chọn Size */}
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Baseline className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={data.theme.fontSize || "14px"}
          onChange={(e) => updateTheme({ fontSize: e.target.value })}
          className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 font-bold outline-none hover:bg-slate-100 transition-all cursor-pointer"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.id} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chọn Ngôn ngữ UI */}
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Globe className="w-3.5 h-3.5 text-indigo-500" />
        <select
          value={data.language || "vi"}
          onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
          className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md px-2 py-1.5 font-bold outline-none hover:bg-indigo-100 transition-all cursor-pointer"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="flex-1 text-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {cvName}
        </span>
      </div>

      {/* Cụm nút thao tác */}
      <div className="flex items-center gap-3 shrink-0">
        {!isSaving && (
          <span className="hidden lg:flex items-center gap-2 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Check className="w-3 h-3" />
            {t.common.synced}
          </span>
        )}

        {/* NÚT XUẤT PDF */}
        <Button
          onClick={exportPdf}
          disabled={isSaving}
          variant="outline"
          size="sm"
          className="gap-2 h-9 px-4 font-black border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          ) : (
            <Printer className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="text-xs uppercase">
            {isSaving ? t.common.syncing : t.common.export_pdf}
          </span>
        </Button>

        {/* NÚT LƯU */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className={cn(
            "gap-2 h-9 px-4 font-black transition-all active:scale-95 shadow-md shadow-indigo-200/50",
            isSaving
              ? "bg-slate-100 text-slate-400"
              : "bg-indigo-600 text-white hover:bg-indigo-700",
          )}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span className="text-xs uppercase">
            {isSaving ? t.common.syncing : t.common.save}
          </span>
        </Button>
      </div>
    </header>
  );
};

export default EditorToolbar;
