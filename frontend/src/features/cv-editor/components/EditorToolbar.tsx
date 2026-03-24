import React from "react";
import {
  Save,
  Loader2,
  Check,
  ArrowLeft,
  Palette,
  Type,
  Baseline, // Thay thế TextSize bằng Baseline
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCvStore } from "@/stores/useCvStore";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { id: "modern-01", label: "Modern" },
  { id: "classic-01", label: "Classic" },
  { id: "minimal-01", label: "Minimal" },
  { id: "creative-01", label: "Creative" },
];

const FONTS = [
  { id: "font-inter", label: "Inter", value: "'Inter', sans-serif" },
  { id: "font-roboto", label: "Roboto", value: "'Roboto', sans-serif" },
  {
    id: "font-montserrat",
    label: "Montserrat",
    value: "'Montserrat', sans-serif",
  },
];

const FONT_SIZES = [
  { id: "size-sm", label: "Nhỏ", value: "12px" },
  { id: "size-md", label: "Vừa", value: "14px" },
  { id: "size-lg", label: "Lớn", value: "16px" },
];

interface EditorToolbarProps {
  cvName: string;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const EditorToolbar = ({ cvName, onSave, isSaving }: EditorToolbarProps) => {
  const { data, updateTheme, updateCvField } = useCvStore();

  const handleTemplateChange = (templateId: string) => {
    updateCvField("template_id", templateId);
    updateTheme({ template_id: templateId });
  };

  if (!data) return null;

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-[100] shadow-sm">
      {/* Nút quay lại */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mr-2 group shrink-0"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline font-bold">Dashboard</span>
      </Link>

      <div className="w-px h-6 bg-slate-200 shrink-0" />

      {/* Chọn Font */}
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Type className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={data.theme.font_family || "'Inter', sans-serif"}
          onChange={(e) => updateTheme({ font_family: e.target.value })}
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
          value={data.theme.font_size || "14px"}
          onChange={(e) => updateTheme({ font_size: e.target.value })}
          className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 font-bold outline-none hover:bg-slate-100 transition-all cursor-pointer"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.id} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1" />

      {/* Nút Lưu */}
      <div className="flex items-center gap-4 shrink-0">
        {!isSaving && (
          <span className="hidden lg:flex items-center gap-2 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Check className="w-3 h-3" />
            SYNCED
          </span>
        )}

        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className={cn(
            "gap-2 h-9 px-4 font-black transition-all active:scale-95 shadow-md",
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
            {isSaving ? "Saving..." : "Save"}
          </span>
        </Button>
      </div>
    </header>
  );
};

export default EditorToolbar;
