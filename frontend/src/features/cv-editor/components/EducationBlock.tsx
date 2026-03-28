import React from "react";
// 1. Đồng bộ Type: Sử dụng CvSection và CvItem từ types/cv.ts
import { CvSection, CvItem } from "../../../types/cv";
import { GraduationCap, Calendar, PlusCircle, Trash2 } from "lucide-react";
import { InlineRichText } from "./InlineRichText";
import { useCvStore } from "../../../stores/useCvStore";

interface EducationBlockProps {
  section: CvSection;
  primaryColor?: string;
  templateId?: string;
}

export const EducationBlock: React.FC<EducationBlockProps> = ({
  section,
  primaryColor = "#3b82f6",
  templateId = "standard",
}) => {
  const addItem = useCvStore((state) => state.addItem);
  const updateItemField = useCvStore((state) => state.updateItemField);
  const removeItem = useCvStore((state) => state.removeItem);

  // Kiểm tra an toàn
  if (!section || !section.visible) return null;

  // Xác định style dựa trên templateId
  const isHarvard = templateId.toLowerCase().includes("harvard");

  return (
    <div
      className={`space-y-4 py-2 group/section ${isHarvard ? "font-serif" : "font-sans"}`}
    >
      <div className="space-y-6">
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className={`group/item relative transition-all ${
              isHarvard
                ? "pl-0"
                : "pl-10 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-[-24px] before:w-[1.5px] before:bg-slate-100 last:before:hidden"
            }`}
          >
            {/* Nút xóa Item - Hiện khi hover (Chỉ hiện trong Editor, ẩn khi Print) */}
            <button
              type="button"
              onClick={() => removeItem(section.id, item.id)}
              className="absolute -left-8 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm transition-all z-20 print:hidden"
              title="Xóa mục này"
            >
              <Trash2 size={12} />
            </button>

            {/* Icon trang trí & Timeline Dot - Chỉ hiện ở Modern/Standard */}
            {!isHarvard && (
              <div
                className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm z-10"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <GraduationCap size={12} style={{ color: primaryColor }} />
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              {/* DÒNG 1: Tên ngành học & Thời gian */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <InlineRichText
                    value={item.title || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "title", val)
                    }
                    className={`block w-full outline-none leading-snug ${
                      isHarvard
                        ? "font-bold text-[15px] text-slate-900"
                        : "font-bold text-[14px] text-slate-800"
                    }`}
                    placeholder="Tên ngành học / Khóa đào tạo..."
                  />
                </div>

                <div
                  className={`flex items-center gap-1.5 shrink-0 transition-all ${
                    isHarvard
                      ? "text-[14px] font-bold text-slate-900"
                      : "text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
                  }`}
                >
                  {!isHarvard && (
                    <Calendar size={10} style={{ color: primaryColor }} />
                  )}
                  <InlineRichText
                    value={item.date || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "date", val)
                    }
                    className={`text-right bg-transparent outline-none ${
                      isHarvard ? "w-32" : "w-28 uppercase"
                    }`}
                    placeholder="2018 - 2022"
                  />
                </div>
              </div>

              {/* DÒNG 2: Tên trường học (Subtitle) */}
              <div className="flex justify-between items-center">
                <InlineRichText
                  value={item.subtitle || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "subtitle", val)
                  }
                  className={`block w-full outline-none ${
                    isHarvard
                      ? "text-[14px] italic text-slate-800"
                      : "text-[13px] font-semibold"
                  }`}
                  style={!isHarvard ? { color: primaryColor } : {}}
                  placeholder="Trường Đại học Bách Khoa..."
                />

                {/* Location - Chỉ mẫu Harvard thường hay để vị trí ở dòng này */}
                {isHarvard && item.location && (
                  <span className="text-[14px] italic text-slate-800">
                    {item.location}
                  </span>
                )}
              </div>

              {/* DÒNG 3: Mô tả (GPA, Thành tựu) */}
              <div className="mt-1">
                <InlineRichText
                  value={item.description || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "description", val)
                  }
                  className={`block w-full min-h-[1.5em] outline-none ${
                    isHarvard
                      ? "text-[13px] text-slate-700 leading-relaxed"
                      : "text-[12px] text-slate-500 italic"
                  }`}
                  placeholder=""
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NÚT THÊM MỚI (Ẩn khi in) */}
      <button
        type="button"
        onClick={() => addItem(section.id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed transition-all uppercase tracking-wider hover:bg-slate-50 active:scale-95 print:hidden ${
          isHarvard ? "ml-0 text-[10px]" : "ml-10 text-[11px]"
        } font-bold text-slate-400 border-slate-200`}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = primaryColor;
          e.currentTarget.style.borderColor = primaryColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#94a3b8";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }}
      >
        <PlusCircle size={14} />
        Thêm học vấn
      </button>
    </div>
  );
};

export default EducationBlock;
