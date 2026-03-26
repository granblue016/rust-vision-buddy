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

interface CVPreviewProps {}

const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>((_props, ref) => {
  const { data, isLoading, error, updateItemField } = useCvStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-[21cm] mx-auto bg-white shadow-md rounded-xl border-2 border-dashed border-slate-200">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium italic">
          Đang kết nối với Rust Backend...
        </p>
      </div>
    );
  }

  if (error || !data || !data.sections) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-[21cm] mx-auto bg-white shadow-md border border-red-100 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">
          Lỗi hiển thị dữ liệu
        </h3>
        <p className="text-slate-500 text-sm mt-2">
          {error || "Không tìm thấy cấu trúc CV hợp lệ."}
        </p>
      </div>
    );
  }

  const { theme, sections, layout } = data;

  // Hàm render nội dung từng section, truyền primaryColor xuống các Block con
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
                  style={{ color: theme.primaryColor }} // Dùng màu từ theme cho Title
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
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 text-[0.95em] text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} style={{ color: theme.primaryColor }} />
                    <input
                      className="bg-transparent border-none p-0 focus:ring-0 w-44 text-inherit"
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
                    <Phone size={14} style={{ color: theme.primaryColor }} />
                    <input
                      className="bg-transparent border-none p-0 focus:ring-0 w-32 text-inherit"
                      value={item.phone || ""}
                      placeholder="Số điện thoại"
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
                    <MapPin size={14} style={{ color: theme.primaryColor }} />
                    <input
                      className="bg-transparent border-none p-0 focus:ring-0 w-48 text-inherit"
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
        return (
          <ExperienceBlock
            section={section}
            primaryColor={theme.primaryColor}
          />
        );
      case "education":
        return (
          <EducationBlock section={section} primaryColor={theme.primaryColor} />
        );
      case "skills":
        return (
          <SkillsBlock section={section} primaryColor={theme.primaryColor} />
        );
      case "projects":
        return (
          <ProjectsBlock section={section} primaryColor={theme.primaryColor} />
        );
      default:
        return null;
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
                className="font-bold uppercase tracking-[0.15em] whitespace-nowrap"
                style={{ color: theme.primaryColor, fontSize: "1.1em" }}
              >
                {section.title}
              </h3>
              <div
                className="h-[1px] w-full"
                style={{ backgroundColor: `${theme.primaryColor}40` }}
              />
            </div>
          )}
          <div className="px-1">{renderSectionContent(section)}</div>
        </div>
      );
    });
  };

  return (
    <div
      id="cv-preview-root"
      ref={ref}
      className="bg-white shadow-2xl mx-auto my-4 w-[21cm] min-h-[29.7cm] p-[1.5cm] relative transition-all print:shadow-none print:m-0 overflow-hidden text-slate-800"
      style={{
        fontFamily: theme.fontFamily || "Inter, sans-serif",
        fontSize: theme.fontSize || "14px",
        lineHeight: theme.lineHeight || 1.5,
      }}
    >
      <ErrorBoundary>
        <div className="mb-12">
          {renderColumn("fullWidth" as LayoutColumnId)}
        </div>
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-4">
            {renderColumn("leftColumn" as LayoutColumnId)}
          </div>
          <div className="col-span-8 space-y-8 border-l border-slate-100 pl-8">
            {renderColumn("rightColumn" as LayoutColumnId)}
          </div>
        </div>

        {sections.every((s) => !s.visible) && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <EyeOff className="text-slate-300 mb-2" size={48} />
            <p className="text-slate-400 font-medium">Tất cả các mục đang ẩn</p>
          </div>
        )}
      </ErrorBoundary>

      <style>{`
        #cv-preview-root input, #cv-preview-root textarea {
          font-size: inherit; font-family: inherit; line-height: inherit; color: inherit;
        }
        @media print {
          @page { size: A4; margin: 0; }
          #cv-preview-root { padding: 1.5cm !important; width: 210mm !important; height: 297mm !important; }
        }
      `}</style>
    </div>
  );
});

CVPreview.displayName = "CVPreview";
export default CVPreview;
