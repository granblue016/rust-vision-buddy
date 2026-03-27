import React from "react";
// 1. Đồng bộ Type: Sử dụng CvLayoutData từ file types/cv.ts đã thống nhất
import { CvLayoutData } from "../../../types/cv";

// 2. Sửa đường dẫn Blocks: Đảm bảo nhảy đúng từ templates -> editor -> components -> features
import { HeaderBlock } from "../../../features/cv-editor/components/HeaderBlock";
import { ExperienceBlock } from "../../../features/cv-editor/components/ExperienceBlock";
import { EducationBlock } from "../../../features/cv-editor/components/EducationBlock";
import { ProjectsBlock } from "../../../features/cv-editor/components/ProjectsBlock";
import { SkillsBlock } from "../../../features/cv-editor/components/SkillsBlock";

interface HarvardTemplate02Props {
  data: CvLayoutData;
  isPreview?: boolean;
}

export const HarvardTemplate02: React.FC<HarvardTemplate02Props> = ({
  data,
  isPreview = false,
}) => {
  // Kiểm tra an toàn: Ngăn lỗi crash khi dữ liệu Store chưa sẵn sàng
  if (!data || !data.sections) return null;

  const { personalInfo, sections, theme } = data;
  const primaryColor = theme.primaryColor || "#000000"; // Giữ sắc đen chuẩn Harvard

  // Hàm helper tìm section dựa trên ID thực tế trong file cv.ts
  const getSection = (id: string) => sections.find((s) => s.id === id);

  return (
    <div
      className="bg-white min-h-[297mm] w-full shadow-2xl px-12 py-12 m-0 print:shadow-none transition-all duration-500 text-slate-900"
      style={{
        fontFamily: theme.fontFamily || "serif",
        fontSize: theme.fontSize || "14px",
      }}
    >
      {/* 1. HEADER: Tối giản, căn giữa */}
      <HeaderBlock
        personalInfo={personalInfo}
        theme={theme}
        isPreview={isPreview}
        primaryColor={primaryColor}
        templateId="harvard-02"
      />

      <div className="space-y-8 mt-10">
        {/* 2. HỌC VẤN (Sử dụng ID section-edu) */}
        {getSection("section-edu")?.visible && (
          <div className="grid grid-cols-12 gap-4 break-inside-avoid">
            <div className="col-span-3 text-right pr-4 border-r-2 border-slate-900">
              <h2 className="text-[11px] font-bold uppercase tracking-widest mt-1">
                Education
              </h2>
            </div>
            <div className="col-span-9">
              <EducationBlock
                section={getSection("section-edu")!}
                primaryColor={primaryColor}
                templateId="harvard-02"
              />
            </div>
          </div>
        )}

        {/* 3. KINH NGHIỆM (Sử dụng ID section-exp) */}
        {getSection("section-exp")?.visible && (
          <div className="grid grid-cols-12 gap-4 break-inside-avoid">
            <div className="col-span-3 text-right pr-4 border-r-2 border-slate-900">
              <h2 className="text-[11px] font-bold uppercase tracking-widest mt-1">
                Experience
              </h2>
            </div>
            <div className="col-span-9">
              <ExperienceBlock
                section={getSection("section-exp")!}
                primaryColor={primaryColor}
                templateId="harvard-02"
              />
            </div>
          </div>
        )}

        {/* 4. DỰ ÁN (Sử dụng ID section-projects) */}
        {getSection("section-projects")?.visible && (
          <div className="grid grid-cols-12 gap-4 break-inside-avoid">
            <div className="col-span-3 text-right pr-4 border-r-2 border-slate-900">
              <h2 className="text-[11px] font-bold uppercase tracking-widest mt-1">
                Projects
              </h2>
            </div>
            <div className="col-span-9">
              <ProjectsBlock
                section={getSection("section-projects")!}
                primaryColor={primaryColor}
                templateId="harvard-02"
              />
            </div>
          </div>
        )}

        {/* 5. KỸ NĂNG (Sử dụng ID section-skills) */}
        {getSection("section-skills")?.visible && (
          <div className="grid grid-cols-12 gap-4 break-inside-avoid">
            <div className="col-span-3 text-right pr-4 border-r-2 border-slate-900">
              <h2 className="text-[11px] font-bold uppercase tracking-widest mt-1">
                Skills
              </h2>
            </div>
            <div className="col-span-9">
              <SkillsBlock
                section={getSection("section-skills")!}
                isPreview={isPreview}
                primaryColor={primaryColor}
                templateId="harvard-02"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer cho bản in */}
      <footer className="mt-20 text-center text-[9px] text-slate-300 hidden print:block italic">
        Confidential - {personalInfo?.fullName}
      </footer>
    </div>
  );
};

export default HarvardTemplate02;
