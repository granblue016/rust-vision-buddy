import { useCvStore } from "@/stores/useCvStore";
import { User, Target, GraduationCap, Briefcase, Wrench, Mail, Phone, MapPin } from "lucide-react";

const HeaderSection = ({ color }: { color: string }) => (
  <div className="text-center pb-5 mb-5" style={{ borderBottom: `2px solid ${color}` }}>
    <h1 className="text-2xl font-bold tracking-tight" style={{ color }}>
      NGUYỄN VĂN A
    </h1>
    <p className="text-sm mt-1 font-medium" style={{ color: "#64748b" }}>Frontend Developer</p>
    <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: "#94a3b8" }}>
      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> email@example.com</span>
      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 0912 345 678</span>
      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> TP. Hồ Chí Minh</span>
    </div>
  </div>
);

const SummarySection = ({ color }: { color: string }) => (
  <div className="mb-5">
    <h2 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color }}>
      <Target className="w-3.5 h-3.5" /> Mục tiêu nghề nghiệp
    </h2>
    <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
      Lập trình viên Frontend với 3 năm kinh nghiệm phát triển ứng dụng web. Mong muốn gia nhập đội ngũ công nghệ sáng tạo để đóng góp và phát triển kỹ năng chuyên môn.
    </p>
  </div>
);

const EducationSection = ({ color }: { color: string }) => (
  <div className="mb-5">
    <h2 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color }}>
      <GraduationCap className="w-3.5 h-3.5" /> Học vấn
    </h2>
    <div className="ml-5">
      <div className="flex justify-between items-baseline">
        <h3 className="text-xs font-semibold" style={{ color: "#1e293b" }}>Đại học Bách Khoa TP.HCM</h3>
        <span className="text-[10px]" style={{ color: "#94a3b8" }}>2017 – 2021</span>
      </div>
      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Kỹ sư Khoa học Máy tính — GPA: 3.45/4.0</p>
    </div>
  </div>
);

const ExperienceSection = ({ color }: { color: string }) => (
  <div className="mb-5">
    <h2 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color }}>
      <Briefcase className="w-3.5 h-3.5" /> Kinh nghiệm làm việc
    </h2>
    <div className="ml-5 space-y-3">
      <div>
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-semibold" style={{ color: "#1e293b" }}>Senior Frontend Developer</h3>
          <span className="text-[10px]" style={{ color: "#94a3b8" }}>2022 – Hiện tại</span>
        </div>
        <p className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>Công ty ABC Technology</p>
        <ul className="mt-1 space-y-0.5 text-xs list-disc list-inside" style={{ color: "#475569" }}>
          <li>Phát triển hệ thống quản lý nội bộ sử dụng React & TypeScript</li>
          <li>Tối ưu hiệu suất trang web, cải thiện Core Web Vitals 40%</li>
          <li>Mentoring 3 junior developers trong team</li>
        </ul>
      </div>
      <div>
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-semibold" style={{ color: "#1e293b" }}>Junior Developer</h3>
          <span className="text-[10px]" style={{ color: "#94a3b8" }}>2021 – 2022</span>
        </div>
        <p className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>Startup XYZ</p>
        <ul className="mt-1 space-y-0.5 text-xs list-disc list-inside" style={{ color: "#475569" }}>
          <li>Xây dựng landing page và dashboard cho sản phẩm SaaS</li>
          <li>Tham gia code review và viết unit test</li>
        </ul>
      </div>
    </div>
  </div>
);

const SkillsSection = ({ color }: { color: string }) => (
  <div className="mb-5">
    <h2 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color }}>
      <Wrench className="w-3.5 h-3.5" /> Kỹ năng
    </h2>
    <div className="ml-5 grid grid-cols-2 gap-x-6 gap-y-1.5">
      {[
        { name: "React / TypeScript", level: 90 },
        { name: "Tailwind CSS", level: 85 },
        { name: "Node.js / Express", level: 70 },
        { name: "Git / CI-CD", level: 80 },
      ].map((skill) => (
        <div key={skill.name} className="flex items-center gap-2">
          <span className="text-xs w-28 shrink-0" style={{ color: "#475569" }}>{skill.name}</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f1f5f9" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${skill.level}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const sectionRenderers: Record<string, React.FC<{ color: string }>> = {
  header: HeaderSection,
  summary: SummarySection,
  education: EducationSection,
  experience: ExperienceSection,
  skills: SkillsSection,
};

const CvPreviewCanvas = () => {
  const { data } = useCvStore();
  const color = data.theme.primary_color;

  return (
    <div className="flex-1 overflow-auto bg-muted/30 p-8 flex justify-center">
      <div
        className="bg-white rounded-sm w-full max-w-3xl mx-auto"
        style={{
          aspectRatio: "210 / 297",
          fontFamily: data.theme.font_family,
          maxHeight: "calc(100vh - 6rem)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <div className="p-10 h-full overflow-auto">
          {data.sections.map((section) => {
            if (!section.visible) return null;
            const Renderer = sectionRenderers[section.type];
            if (!Renderer) return null;
            return <Renderer key={section.id} color={color} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default CvPreviewCanvas;
