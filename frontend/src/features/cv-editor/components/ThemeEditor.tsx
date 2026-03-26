import React from "react";
import { useCvStore } from "../../../stores/useCvStore";
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, COLOR_PALETTE } from "../../../constants/theme";

export const ThemeEditor: React.FC = () => {
  const { data, updateTheme } = useCvStore();
  const theme = data.theme;

  return (
    <div className="p-4 space-y-6 border-b border-gray-200">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
        Thiết kế CV
      </h3>

      {/* 1. Chọn Font chữ */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500">Phông chữ</label>
        <select
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          value={theme.fontFamily}
          onChange={(e) => updateTheme({ fontFamily: e.target.value })}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Chọn Kích thước chữ (Dải rộng) */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-medium text-gray-500">Kích thước</label>
          <span className="text-xs text-gray-400">{theme.fontSize}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {FONT_SIZE_OPTIONS.map((size) => (
            <button
              key={size.value}
              onClick={() => updateTheme({ fontSize: size.value })}
              className={`py-1 text-[10px] border rounded transition-all ${
                theme.fontSize === size.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Chọn Màu chủ đạo */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500">Màu chủ đạo</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => updateTheme({ primaryColor: color })}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                theme.primaryColor === color ? "border-gray-400 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
