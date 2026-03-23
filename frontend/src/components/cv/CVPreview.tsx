import React from "react";
import { useCvStore } from "../../stores/useCvStore";
import ErrorBoundary from "../../shared/components/layout/ErrorBoundary";
import { LayoutColumnId, CvSection } from "../../types/cv";

// SỬA LỖI IMPORT: Dựa trên lỗi (ts 2613), các component này dùng Named Export { }
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

const CVPreview: React.FC = () => {
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
          {error ||
            "Không tìm thấy cấu trúc CV hợp lệ. Vui lòng thử lại hoặc khởi tạo lại dữ liệu."}
        </p>
      </div>
    );
  }

  const { theme, sections, layout } = data;

  /**
   * Hàm điều hướng render dựa trên TYPE của Section
   */
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
                      placeholder="Địa chỉ, Thành phố"
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
    // SỬA LỖI: Đảm bảo layout tồn tại trước khi map
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
      className="bg-white shadow-2xl mx-auto my-4 w-[21cm] min-h-[29.7cm] p-[1.5cm] relative transition-all print:shadow-none print:m-0 overflow-hidden text-slate-800"
      style={{
        fontFamily: theme.font_family || "Inter, sans-serif",
        fontSize: theme.font_size || "14px",
        lineHeight: theme.line_height || 1.5,
      }}
    >
      <ErrorBoundary>
        {/* Render Header (Full Width) */}
        <div className="mb-12">{renderColumn("fullWidth")}</div>

        {/* Layout 2 Cột */}
        <div className="grid grid-cols-12 gap-10">
          {/* Cột Trái (Sidebar) */}
          <div className="col-span-4">{renderColumn("leftColumn")}</div>

          {/* Cột Phải (Main Content) */}
          <div className="col-span-8 space-y-8 border-l border-slate-100 pl-8">
            {renderColumn("rightColumn")}
          </div>
        </div>

        {/* Overlay khi ẩn hết */}
        {isAllHidden && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
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
          #cv-preview-root { padding: 1.5cm !important; width: 100% !important; height: 100% !important; box-shadow: none !important; }
          input, textarea { border: none !important; outline: none !important; background: transparent !important; }
        }
        /* Ẩn thanh scrollbar khi preview */
        #cv-preview-root::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CVPreview;
