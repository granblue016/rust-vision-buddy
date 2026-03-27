import React from "react";
// 1. Đồng bộ Type: Sử dụng CvLayoutData từ file types/cv.ts đã thống nhất
import { CvLayoutData } from "../../../types/cv";

// 2. Sửa đường dẫn Blocks: Nhảy chính xác từ templates ra features/cv-editor
import { HeaderBlock } from "../../../features/cv-editor/components/HeaderBlock";
import { ExperienceBlock } from "../../../features/cv-editor/components/ExperienceBlock";
import { EducationBlock } from "../../../features/cv-editor/components/EducationBlock";
import { ProjectsBlock } from "../../../features/cv-editor/components/ProjectsBlock";
import { SkillsBlock } from "../../../features/cv-editor/components/SkillsBlock";

interface StandardTemplateProps {
  data: CvLayoutData;
  isPreview?: boolean;
}

export const StandardTemplate: React.FC<StandardTemplateProps> = ({
  data,
  isPreview = false,
}) => {
  // Kiểm tra an toàn: Ngăn lỗi crash khi dữ liệu Store chưa sẵn sàng hoặc rỗng
  if (!data || !data.sections) return null;

  const { personalInfo, sections, theme } = data;

  // Mẫu Standard ưu tiên sử dụng màu chủ đạo từ Theme Editor
  const primaryColor = theme?.primaryColor || "#2563eb";

  // Hàm helper tìm section dựa trên ID thực tế (section-edu, section-exp,...)
  const getSection = (id: string) => sections.find((s) => s.id === id);

  return (
    <div
      className="bg-white min-h-[297mm] w-full shadow-2xl p-0 m-0 print:shadow-none transition-all duration-500"
      style={{
        fontFamily: theme?.fontFamily || "sans-serif",
        fontSize: theme?.fontSize || "14px",
      }}
    >
      {/* 1. Header: Modern style (Full width) */}
      <HeaderBlock
        personalInfo={personalInfo}
        theme={theme}
        isPreview={isPreview}
        primaryColor={primaryColor}
        templateId="standard"
      />

      <div className="grid grid-cols-12 gap-8 px-12 py-8">
        {/* CỘT TRÁI (Main Content - 8/12): Kinh nghiệm & Dự án */}
        <div className="col-span-8 space-y-8 border-r border-slate-50 pr-8">
          {/* Kinh nghiệm làm việc */}
          {getSection("section-exp")?.visible && (
            <section className="break-inside-avoid">
              <h2
                className="text-lg font-bold uppercase tracking-wider mb-4 pb-1 border-b-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Kinh nghiệm làm việc
              </h2>
              <ExperienceBlock
                section={getSection("section-exp")!}
                primaryColor={primaryColor}
                templateId="standard"
              />
            </section>
          )}

          {/* Dự án tiêu biểu */}
          {getSection("section-projects")?.visible && (
            <section className="break-inside-avoid">
              <h2
                className="text-lg font-bold uppercase tracking-wider mb-4 pb-1 border-b-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Dự án tiêu biểu
              </h2>
              <ProjectsBlock
                section={getSection("section-projects")!}
                primaryColor={primaryColor}
                templateId="standard"
              />
            </section>
          )}
        </div>

        {/* CỘT PHẢI (Sidebar - 4/12): Học vấn & Kỹ năng */}
        <div className="col-span-4 space-y-8">
          {/* Học vấn */}
          {getSection("section-edu")?.visible && (
            <section className="break-inside-avoid">
              <h2
                className="text-md font-bold uppercase tracking-wider mb-4 pb-1 border-b"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Học vấn
              </h2>
              <EducationBlock
                section={getSection("section-edu")!}
                primaryColor={primaryColor}
                templateId="standard"
              />
            </section>
          )}

          {/* Kỹ năng */}
          {getSection("section-skills")?.visible && (
            <section className="break-inside-avoid">
              <h2
                className="text-md font-bold uppercase tracking-wider mb-4 pb-1 border-b"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Kỹ năng
              </h2>
              <SkillsBlock
                section={getSection("section-skills")!}
                isPreview={isPreview}
                primaryColor={primaryColor}
                templateId="standard"
              />
            </section>
          )}
        </div>
      </div>

      {/* Footer trang trí đồng bộ màu chủ đạo */}
      <div
        className="h-2 w-full mt-auto"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
};

export default StandardTemplate;
