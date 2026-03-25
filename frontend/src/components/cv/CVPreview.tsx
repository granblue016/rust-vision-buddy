import React, { forwardRef } from "react";
import { useCvStore } from "../../stores/useCvStore";
import ErrorBoundary from "../../shared/components/layout/ErrorBoundary";
import { LayoutColumnId, CvSection } from "../../types/cv";

import { ExperienceBlock } from "../../features/cv-editor/components/ExperienceBlock";
import { EducationBlock } from "../../features/cv-editor/components/EducationBlock";
import { SkillsBlock } from "../../features/cv-editor/components/SkillsBlock";
import { ProjectsBlock } from "../../features/cv-editor/components/ProjectsBlock";

import {
  Loader2,
  AlertCircle,
  EyeOff,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

// FIX: Định nghĩa Interface trống cho Props nếu bạn không truyền props từ ngoài vào
interface CVPreviewProps {}

// FIX: forwardRef<Kiểu_Dữ_Liệu_DOM, Kiểu_Dữ_Liệu_Props>
const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>((props, ref) => {
  const { data, isLoading, error, updateItemField } = useCvStore();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-[21cm] mx-auto bg-white shadow-md rounded-xl border-2 border-dashed border-slate-200">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium italic">
          Đang kết nối với Rust Backend...
        </p>
      </div>
    );
  }

  // 2. Error hoặc Data null
  if (error || !data || !data.sections) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-[21cm] mx-auto bg-white shadow-md border border-red-100 rounded-xl p-8 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          Lỗi hiển thị dữ liệu
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">
          {error || "Không tìm thấy cấu trúc CV hợp lệ."}
        </p>
      </div>
    );
  }

  const { theme, sections, layout } = data;

  const renderSectionContent = (section: CvSection) => {
    switch (section.type) {
      case "header":
        return (
          <div className="text-center">
            {section.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <input
                  className="w-full text-4xl font-extrabold text-slate-900 bg-transparent border-none text-center focus:ring-0 p-0 placeholder:text-slate-300"
                  placeholder="HỌ VÀ TÊN"
                  value={item.title || ""}
                  onChange={(e) =>
                    updateItemField(
                      section.id,
                      item.id,
                      "title",
                      e.target.value,
                    )
                  }
                />
                <input
                  className="w-full text-xl font-semibold bg-transparent border-none text-center focus:ring-0 p-0 mb-4"
                  style={{ color: theme.primary_color }}
                  placeholder="Vị trí ứng tuyển"
                  value={item.subtitle || ""}
                  onChange={(e) =>
                    updateItemField(
                      section.id,
                      item.id,
                      "subtitle",
                      e.target.value,
                    )
                  }
                />
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 text-[13px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" />
                    <input
                      className="bg-transparent border-none p-0 focus:ring-0 w-40"
                      value={item.email || ""}
                      placeholder="email@example.com"
                      onChange={(e) =>
                        updateItemField(
                          section.id,
                          item.id,
                          "email",
                          e.target.value,
                        )
                      }
                    />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    <input
                      className="bg-transparent border-none p-0 focus:ring-0 w-32"
                      value={item.phone || ""}
                      placeholder="090 xxx xxxx"
                      onChange={(e) =>
                        updateItemField(
                          section.id,
                          item.id,
                          "phone",
                          e.target.value,
                        )
                      }
                    />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <input
                      className="bg-transparent border-none p-0 focus:ring-0 w-48"
                      value={item.location || ""}
                      placeholder="Địa chỉ"
                      onChange={(e) =>
                        updateItemField(
                          section.id,
                          item.id,
                          "location",
                          e.target.value,
                        )
                      }
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      case "experience":
        return <ExperienceBlock section={section} />;
      case "education":
        return <EducationBlock section={section} />;
      case "skills":
        return <SkillsBlock section={section} />;
      case "projects":
        return <ProjectsBlock section={section} />;
      default:
        return (
          <div className="space-y-2">
            {section.items.map((item) => (
              <input
                key={item.id}
                className="w-full text-sm bg-transparent border-none focus:ring-0 p-0"
                value={item.title || ""}
                onChange={(e) =>
                  updateItemField(section.id, item.id, "title", e.target.value)
                }
              />
            ))}
          </div>
        );
    }
  };

  const renderColumn = (columnId: LayoutColumnId) => {
    const sectionIds = layout?.[columnId] || [];
    return sectionIds.map((sId) => {
      const section = sections.find((s) => s.id === sId);
      if (!section || !section.visible) return null;

      return (
        <div
          key={section.id}
          className="mb-8 last:mb-0 break-inside-avoid group relative"
        >
          {section.type !== "header" && (
            <div className="flex items-center gap-3 mb-4">
              <h3
                className="text-[15px] font-bold uppercase tracking-[0.15em] whitespace-nowrap"
                style={{ color: theme.primary_color }}
              >
                {section.title}
              </h3>
              <div
                className="h-[1px] w-full"
                style={{ backgroundColor: `${theme.primary_color}40` }}
              />
            </div>
          )}
          <div className="px-1">{renderSectionContent(section)}</div>
        </div>
      );
    });
  };

  const isAllHidden = sections.every((s) => !s.visible);

  return (
    <div
      id="cv-preview-root"
      ref={ref} // BÂY GIỜ REF ĐÃ HỢP LỆ
      className="bg-white shadow-2xl mx-auto my-4 w-[21cm] min-h-[29.7cm] p-[1.5cm] relative transition-all print:shadow-none print:m-0 overflow-hidden text-slate-800"
      style={{
        fontFamily: theme.font_family || "Inter, sans-serif",
        fontSize: theme.font_size || "14px",
        lineHeight: theme.line_height || 1.5,
      }}
    >
      <ErrorBoundary>
        <div className="mb-12">{renderColumn("fullWidth")}</div>
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-4">{renderColumn("leftColumn")}</div>
          <div className="col-span-8 space-y-8 border-l border-slate-100 pl-8">
            {renderColumn("rightColumn")}
          </div>
        </div>

        {isAllHidden && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 print:hidden">
            <EyeOff className="text-slate-300 mb-2" size={48} />
            <p className="text-slate-400 font-medium text-lg">
              Tất cả các mục đang ẩn
            </p>
          </div>
        )}
      </ErrorBoundary>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; }
          #cv-preview-root {
            padding: 1.5cm !important;
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          input::placeholder { color: transparent !important; }
        }
      `}</style>
    </div>
  );
});

CVPreview.displayName = "CVPreview";

export default CVPreview;
