import React from "react";
// 1. Đồng bộ Type: Sử dụng CvSection và CvItem từ types/cv.ts
import { CvSection, CvItem } from "../../../types/cv";
import { Briefcase, Calendar, PlusCircle, Trash2 } from "lucide-react";
import { InlineRichText } from "./InlineRichText";
import { useCvStore } from "../../../stores/useCvStore";

interface ExperienceBlockProps {
  section: CvSection;
  primaryColor?: string;
  templateId?: string;
}

export const ExperienceBlock: React.FC<ExperienceBlockProps> = ({
  section,
  primaryColor = "#6366f1",
  templateId = "standard",
}) => {
  const { addItem, updateItemField, removeItem } = useCvStore();

  // Kiểm tra an toàn
  if (!section || !section.visible) return null;

  // Xác định style dựa trên templateId
  const isHarvard = templateId.toLowerCase().includes("harvard");

  return (
    <div
      className={`py-2 group/section ${isHarvard ? "font-serif" : "font-sans"}`}
    >
      <div className={isHarvard ? "space-y-6" : "space-y-8"}>
        {section.items.map((item: CvItem, idx: number) => (
          <div
            key={item.id || idx}
            className={`group/item relative transition-all ${
              isHarvard
                ? "pl-0"
                : "pl-10 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-[-32px] before:w-[1.5px] before:bg-slate-100 last:before:hidden"
            }`}
          >
            {/* Nút xóa Item - Ẩn khi in */}
            <button
              type="button"
              onClick={() => removeItem(section.id, item.id)}
              className="absolute -left-8 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm transition-all z-20 print:hidden"
              title="Xóa mục này"
            >
              <Trash2 size={12} />
            </button>

            {/* Icon Timeline - Chỉ hiện ở Modern/Standard */}
            {!isHarvard && (
              <div
                className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm z-10"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <Briefcase size={11} style={{ color: primaryColor }} />
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              {/* DÒNG 1: Tiêu đề chính & Ngày tháng */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <InlineRichText
                    value={isHarvard ? item.subtitle || "" : item.title || ""}
                    onChange={(val) =>
                      updateItemField(
                        section.id,
                        item.id,
                        isHarvard ? "subtitle" : "title",
                        val,
                      )
                    }
                    className={`block w-full outline-none leading-snug ${
                      isHarvard
                        ? "text-[15px] font-bold uppercase tracking-tight text-slate-900"
                        : "text-[15px] font-bold text-slate-800"
                    }`}
                    placeholder={
                      isHarvard
                        ? "TÊN CÔNG TY / TỔ CHỨC"
                        : "Vị trí công việc (VD: Senior Developer)"
                    }
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
                      isHarvard ? "w-32" : "w-32 uppercase tracking-tighter"
                    }`}
                    placeholder="2022 - Hiện tại"
                  />
                </div>
              </div>

              {/* DÒNG 2: Tiêu đề phụ (Vị trí hoặc Công ty) & Địa điểm */}
              <div className="flex justify-between items-center">
                <InlineRichText
                  value={isHarvard ? item.title || "" : item.subtitle || ""}
                  onChange={(val) =>
                    updateItemField(
                      section.id,
                      item.id,
                      isHarvard ? "title" : "subtitle",
                      val,
                    )
                  }
                  className={`block w-full outline-none ${
                    isHarvard
                      ? "text-[14px] italic text-slate-800"
                      : "text-[13px] font-semibold"
                  }`}
                  style={!isHarvard ? { color: primaryColor } : {}}
                  placeholder={
                    isHarvard ? "Vị trí công việc" : "Tên công ty / Tổ chức"
                  }
                />

                {/* Location (Địa điểm) - Rất quan trọng cho mẫu Harvard */}
                {isHarvard && (
                  <InlineRichText
                    value={item.location || ""}
                    onChange={(val) =>
                      updateItemField(section.id, item.id, "location", val)
                    }
                    className="text-[14px] italic text-slate-800 text-right min-w-[100px]"
                    placeholder="Địa điểm..."
                  />
                )}
              </div>

              {/* DÒNG 3: Mô tả chi tiết (Nội dung công việc) */}
              <div
                className={`mt-2 ${isHarvard ? "" : "opacity-95 group-hover/item:opacity-100"}`}
              >
                <InlineRichText
                  value={item.description || ""}
                  onChange={(val) =>
                    updateItemField(section.id, item.id, "description", val)
                  }
                  className={`block w-full min-h-[1.5em] outline-none text-slate-700 leading-relaxed ${
                    isHarvard ? "text-[13px]" : "text-[13px]"
                  }`}
                  placeholder="Mô tả chi tiết các thành tựu và trách nhiệm chính của bạn..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NÚT THÊM MỚI - Ẩn khi in */}
      <button
        type="button"
        onClick={() => addItem(section.id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed transition-all mt-6 uppercase tracking-wider hover:bg-slate-50 print:hidden ${
          isHarvard ? "ml-0 text-[10px]" : "ml-10 text-[11px]"
        } font-black text-slate-400 border-slate-200`}
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
        Thêm kinh nghiệm
      </button>
    </div>
  );
};

export default ExperienceBlock;
