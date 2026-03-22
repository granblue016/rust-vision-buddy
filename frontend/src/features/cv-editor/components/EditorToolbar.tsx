import { Save, Loader2, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCvStore } from "@/stores/useCvStore";

const TEMPLATES = [
  { id: "modern-01", label: "Modern" },
  { id: "classic-01", label: "Classic" },
  { id: "minimal-01", label: "Minimal" },
  { id: "creative-01", label: "Creative" },
];

const EditorToolbar = ({ onSave }: { onSave: () => void }) => {
  const { data, updateTheme, setTemplateId, isSaving, lastSaved } = useCvStore();

  return (
    <header className="h-14 shrink-0 border-b border-border bg-card flex items-center px-4 gap-4">
      <Link
        to="/dashboard"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      <div className="w-px h-6 bg-border" />

      {/* Template Select */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Template
        </label>
        <select
          value={data.template_id}
          onChange={(e) => setTemplateId(e.target.value)}
          className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Màu chủ đạo
        </label>
        <div className="relative">
          <input
            type="color"
            value={data.theme.primary_color}
            onChange={(e) => updateTheme(e.target.value)}
            className="w-8 h-8 rounded-lg border-2 border-border cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {data.theme.primary_color}
        </span>
      </div>

      <div className="flex-1" />

      {/* Save Status */}
      <div className="flex items-center gap-3">
        {isSaving && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Đang lưu...
          </span>
        )}
        {!isSaving && lastSaved && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-accent" />
            Đã lưu {lastSaved.toLocaleTimeString("vi-VN")}
          </span>
        )}

        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
        >
          <Save className="w-4 h-4" />
          Lưu
        </Button>
      </div>
    </header>
  );
};

export default EditorToolbar;
