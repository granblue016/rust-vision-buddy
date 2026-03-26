import React from "react";
import { useCvStore } from "../../../stores/useCvStore";
// Đảm bảo các constants này đã được định nghĩa trong file theme.ts của bạn
import {
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_PALETTE,
} from "../../../constants/theme";

export const ThemeEditor: React.FC = () => {
  const { data, updateTheme } = useCvStore();
  const theme = data.theme;

  // Helper để cập nhật theme và đảm bảo kiểu dữ liệu chuẩn cho Rust (lineHeight là số)
  const handleThemeChange = (updates: Partial<typeof theme>) => {
    updateTheme(updates);
  };

  return (
    <div className="p-4 space-y-6 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Thiết kế CV
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
          {theme.templateId}
        </span>
      </div>

      {/* 1. Chọn Font chữ - Map trực tiếp vào fontFamily trong Rust */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 flex items-center gap-2">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
            />
          </svg>
          Phông chữ
        </label>
        <select
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:border-gray-400"
          value={theme.fontFamily}
          onChange={(e) => handleThemeChange({ fontFamily: e.target.value })}
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

      {/* 2. Chọn Kích thước chữ - Map trực tiếp vào fontSize */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-500">
            Kích thước
          </label>
          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 rounded">
            {theme.fontSize}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FONT_SIZE_OPTIONS.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => handleThemeChange({ fontSize: size.value })}
              className={`flex-1 min-w-[45px] py-1.5 text-[10px] font-medium border rounded-md transition-all ${
                theme.fontSize === size.value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Khoảng cách dòng - Bổ sung để khớp với lineHeight f32 trong Rust */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-500">Dãn dòng</label>
          <span className="text-[10px] font-mono text-gray-400">
            {theme.lineHeight}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="2"
          step="0.1"
          value={theme.lineHeight}
          onChange={(e) =>
            handleThemeChange({ lineHeight: parseFloat(e.target.value) })
          }
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>

      {/* 4. Chọn Màu chủ đạo - Map trực tiếp vào primaryColor */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-gray-500">Màu chủ đạo</label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleThemeChange({ primaryColor: color })}
              className={`w-7 h-7 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${
                theme.primaryColor.toLowerCase() === color.toLowerCase()
                  ? "border-gray-900 scale-110 shadow-md"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            >
              {theme.primaryColor.toLowerCase() === color.toLowerCase() && (
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              )}
            </button>
          ))}

          {/* Custom Color Picker */}
          <div className="relative w-7 h-7">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) =>
                handleThemeChange({ primaryColor: e.target.value })
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-full h-full rounded-full border border-gray-200 flex items-center justify-center bg-gradient-to-tr from-red-500 via-green-500 to-blue-500"
              title="Chọn màu tùy chỉnh"
            >
              <span className="text-[10px] text-white font-bold">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
