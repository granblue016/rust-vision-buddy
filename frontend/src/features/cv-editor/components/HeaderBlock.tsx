import React from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { InlineRichText } from "./InlineRichText";
import { useCvStore } from "../../../stores/useCvStore";
import { PersonalInfo, CvTheme } from "../../../types/cv";

interface HeaderBlockProps {
  personalInfo?: PersonalInfo;
  theme?: CvTheme;
  isPreview?: boolean;
}

// --- FAIL-SAFE UTILITY ---
const safeClean = (html: string | undefined, fallback: string): string => {
  if (!html || html.trim() === "") return fallback;
  return html
    .replace(/<\/?[^>]+(>|$)/g, "") // Xóa tất cả các loại thẻ HTML
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

export const HeaderBlock: React.FC<HeaderBlockProps> = ({
  personalInfo: propsInfo,
  theme: propsTheme,
  isPreview = false,
}) => {
  const storeData = useCvStore((state) => state.data);
  const updatePersonalInfo = useCvStore((state) => state.updatePersonalInfo);

  const info = isPreview ? propsInfo : storeData.personalInfo;
  const theme = isPreview ? propsTheme : storeData.theme;

  if (!info) return null;
  const primaryColor = theme?.primaryColor || "#4f46e5";

  return (
    // THÊM ID "main-cv-header" ĐỂ BACKEND PHÂN BIỆT
    <header
      id="main-cv-header"
      className="flex flex-col items-center text-center space-y-4 pb-8 border-b-2 border-slate-100 mb-8 w-full print:border-slate-200 print:mb-6"
    >
      {/* 1. HỌ TÊN */}
      <div className="w-full px-4">
        {isPreview ? (
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight leading-tight">
            {safeClean(info.fullName, "HỌ TÊN CỦA BẠN")}
          </h1>
        ) : (
          <InlineRichText
            value={info.fullName || ""}
            onChange={(val: string) => updatePersonalInfo("fullName", val)}
            className="text-4xl font-black text-slate-800 uppercase tracking-tight leading-tight outline-none focus:ring-1 focus:ring-indigo-200 rounded-sm transition-all"
            placeholder="HỌ TÊN CỦA BẠN"
          />
        )}
      </div>

      {/* 2. VỊ TRÍ ỨNG TUYỂN */}
      <div className="w-full px-4">
        {isPreview ? (
          <p
            className="text-lg font-bold uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            {safeClean(info.title, "VỊ TRÍ ỨNG TUYỂN")}
          </p>
        ) : (
          <div style={{ color: primaryColor }}>
            <InlineRichText
              value={info.title || ""}
              onChange={(val: string) => updatePersonalInfo("title", val)}
              className="text-lg font-bold uppercase tracking-[0.2em] outline-none focus:ring-1 focus:ring-indigo-100 rounded-sm transition-all w-full text-center"
              placeholder="VỊ TRÍ ỨNG TUYỂN"
            />
          </div>
        )}
      </div>

      {/* 3. THÔNG TIN LIÊN HỆ - Thêm class nhận diện đặc thù */}
      <div className="cv-contact-container flex flex-wrap justify-center items-center gap-y-3 gap-x-8 mt-4 text-[13px] text-slate-600 max-w-4xl">
        <ContactItem
          icon={<Phone size={14} style={{ color: primaryColor }} />}
          value={info.phone}
          isPreview={isPreview}
          placeholder="Số điện thoại"
          onChange={(val: string) => updatePersonalInfo("phone", val)}
        />
        <ContactItem
          icon={<Mail size={14} style={{ color: primaryColor }} />}
          value={info.email}
          isPreview={isPreview}
          placeholder="Email liên hệ"
          onChange={(val: string) => updatePersonalInfo("email", val)}
        />
        <ContactItem
          icon={<MapPin size={14} style={{ color: primaryColor }} />}
          value={info.address}
          isPreview={isPreview}
          placeholder="Địa chỉ"
          onChange={(val: string) => updatePersonalInfo("address", val)}
        />
        {(info.website || !isPreview) && (
          <ContactItem
            icon={<Globe size={14} style={{ color: primaryColor }} />}
            value={info.website}
            isPreview={isPreview}
            placeholder="Website/LinkedIn"
            onChange={(val: string) => updatePersonalInfo("website", val)}
          />
        )}
      </div>
    </header>
  );
};

interface ContactItemProps {
  icon: React.ReactNode;
  value?: string;
  isPreview: boolean;
  placeholder: string;
  onChange: (val: string) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  value,
  isPreview,
  placeholder,
  onChange,
}) => (
  <div className="flex items-center gap-2 group/info cursor-text">
    <div className="p-1 rounded-full bg-slate-50 group-hover/info:bg-indigo-50 transition-colors print:p-0 print:bg-transparent">
      {icon}
    </div>
    {isPreview ? (
      <span className="print:text-slate-700">
        {safeClean(value, placeholder)}
      </span>
    ) : (
      <InlineRichText
        value={value || ""}
        onChange={onChange}
        className="min-w-[80px] border-b border-transparent hover:border-slate-300 focus:border-indigo-400"
        placeholder={placeholder}
      />
    )}
  </div>
);

export default HeaderBlock;
