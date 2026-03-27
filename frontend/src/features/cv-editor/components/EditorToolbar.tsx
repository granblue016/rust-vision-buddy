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
  LayoutTemplate, // Thêm icon cho Template
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

// Định nghĩa danh sách các mẫu CV
const TEMPLATES = [
  { id: "standard-01", label: { vi: "Mẫu Tiêu chuẩn", en: "Standard" } },
  { id: "harvard-01", label: { vi: "Mẫu Harvard", en: "Harvard" } },
  { id: "modern-01", label: { vi: "Mẫu Hiện đại", en: "Modern" } },
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
  const { data, updateTheme, exportPdf, setLanguage } = useCvStore();

  if (!data) return null;

  const t = data.language === "en" ? en : vi;
  const currentLang = data.language || "vi";

  const FONT_SIZES = [
    {
      id: "size-sm",
      label: currentLang === "en" ? "Small" : "Nhỏ",
      value: "12px",
    },
    {
      id: "size-md",
      label: currentLang === "en" ? "Medium" : "Vừa",
      value: "14px",
    },
    {
      id: "size-lg",
      label: currentLang === "en" ? "Large" : "Lớn",
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

      {/* CHỌN TEMPLATE (Mới thêm) */}
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
        <select
          value={data.theme.templateId || "standard-01"}
          onChange={(e) => updateTheme({ templateId: e.target.value })}
          className="text-[11px] bg-indigo-50/50 border border-indigo-100 text-indigo-700 rounded-md px-2 py-1.5 font-black outline-none hover:bg-indigo-100/50 transition-all cursor-pointer uppercase tracking-tighter"
        >
          {TEMPLATES.map((tmpl) => (
            <option key={tmpl.id} value={tmpl.id}>
              {tmpl.label[currentLang as "vi" | "en"]}
            </option>
          ))}
        </select>
      </div>

      <div className="w-px h-4 bg-slate-100 shrink-0 hidden md:block" />

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
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={data.language || "vi"}
          onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
          className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 font-bold outline-none hover:bg-slate-100 transition-all cursor-pointer"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="flex-1 text-center truncate px-4">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] select-none">
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
          <span className="text-xs uppercase hidden sm:inline">
            {isSaving ? t.common.syncing : t.common.export_pdf}
          </span>
        </Button>

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
