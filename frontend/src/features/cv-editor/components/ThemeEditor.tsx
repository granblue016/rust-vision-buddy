import React from "react";
import { useCvStore } from "../../../stores/useCvStore";
import {
  Type,
  MoveVertical,
  Palette,
  LayoutDashboard,
  Type as TypeIcon,
} from "lucide-react";
import {
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_PALETTE,
} from "../../../constants/theme";

export const ThemeEditor: React.FC = () => {
  const { data, updateTheme } = useCvStore();

  if (!data) return null;
  const theme = data.theme;

  // Helper cập nhật theme đồng bộ với Rust backend
  const handleThemeChange = (updates: Partial<typeof theme>) => {
    updateTheme(updates);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full overflow-y-auto custom-scrollbar">
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-gray-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
            Thiết kế hệ thống
          </h3>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold uppercase">
            {theme.templateId?.split("-")[0] || "Standard"}
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Tùy chỉnh phong cách hiển thị toàn bản CV
        </p>
      </div>

      <div className="p-4 space-y-8">
        {/* 1. SECTION: TYPOGRAPHY (FONT FAMILY) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-md">
              <TypeIcon className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">
              Typography
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-medium ml-1">
              Phông chữ hệ thống
            </p>
            <select
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:bg-slate-50 font-medium text-slate-700"
              value={theme.fontFamily}
              onChange={(e) =>
                handleThemeChange({ fontFamily: e.target.value })
              }
            >
              {FONT_OPTIONS.map((font) => (
                <option
                  key={font.id}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. SECTION: TEXT SCALE (FONT SIZE) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Type className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                Cỡ chữ nội dung
              </label>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {theme.fontSize}
            </span>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-lg gap-1">
            {FONT_SIZE_OPTIONS.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => handleThemeChange({ fontSize: size.value })}
                className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all uppercase tracking-tighter ${
                  theme.fontSize === size.value
                    ? "bg-white text-indigo-600 shadow-sm scale-[1.02]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. SECTION: LINE HEIGHT (SPACING) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-md">
                <MoveVertical className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                Dãn dòng (Line Height)
              </label>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {theme.lineHeight}
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={theme.lineHeight}
            onChange={(e) =>
              handleThemeChange({ lineHeight: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1">
            <span>CHẶT CHẼ</span>
            <span>THOẢI MÁI</span>
          </div>
        </div>

        {/* 4. SECTION: COLOR PALETTE */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 rounded-md">
              <Palette className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">
              Màu sắc chủ đạo
            </label>
          </div>

          <div className="grid grid-cols-5 gap-3 px-1">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleThemeChange({ primaryColor: color })}
                className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-125 flex items-center justify-center relative ${
                  theme.primaryColor.toLowerCase() === color.toLowerCase()
                    ? "border-slate-800 ring-2 ring-slate-200 ring-offset-2"
                    : "border-white shadow-sm hover:shadow-md"
                }`}
                style={{ backgroundColor: color }}
              >
                {theme.primaryColor.toLowerCase() === color.toLowerCase() && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            ))}

            {/* Custom Color Picker Button */}
            <div className="relative w-8 h-8 group">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) =>
                  handleThemeChange({ primaryColor: e.target.value })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="w-full h-full rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 group-hover:scale-110 transition-transform"
                title="Chọn màu tùy chỉnh"
              >
                <span className="text-[10px] text-white font-black">+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-2 text-slate-400">
          <LayoutDashboard size={12} />
          <span className="text-[9px] font-bold uppercase tracking-widest">
            AI Engine Optimized
          </span>
        </div>
      </div>
    </div>
  );
};
