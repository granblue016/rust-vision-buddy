import React from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { InlineRichText } from "./InlineRichText";
import { useCvStore } from "../../../stores/useCvStore";
import { PersonalInfo, CvTheme } from "../../../types/cv";

interface HeaderBlockProps {
  personalInfo?: PersonalInfo;
  theme?: CvTheme;
  isPreview?: boolean;
  primaryColor?: string;
  templateId?: string;
}

// Hàm làm sạch HTML và tránh lỗi XSS/Tràn text
const safeClean = (html: string | undefined, fallback: string): string => {
  if (!html || html.trim() === "") return fallback;
  return html
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
};

export const HeaderBlock: React.FC<HeaderBlockProps> = ({
  personalInfo: propsInfo,
  theme: propsTheme,
  isPreview = false,
  primaryColor: propsColor,
  templateId = "standard",
}) => {
  const storeData = useCvStore((state) => state.data);
  const storeName = useCvStore((state) => state.name); // Lấy name từ Store để đồng bộ
  const updatePersonalInfo = useCvStore((state) => state.updatePersonalInfo);

  // VẤN ĐỀ 1 ĐÃ SỬA: Thêm Optional Chaining (?.) để tránh crash khi storeData bị null
  const info = isPreview ? propsInfo : storeData?.personalInfo;
  const theme = isPreview ? propsTheme : storeData?.theme;
  const primaryColor = propsColor || theme?.primaryColor || "#000000";

  // Nếu chưa có dữ liệu info (đang tải), không render gì cả để tránh lỗi
  if (!info) return null;

  const isHarvard = templateId.toLowerCase().includes("harvard");

  // Logic hiển thị tên: Ưu tiên info.fullName, nếu trống thì dùng storeName
  const displayFullName = info.fullName || (!isPreview ? storeName : "") || "";

  return (
    <header
      id="main-cv-header"
      className={`flex flex-col items-center text-center w-full transition-all overflow-hidden ${
        isHarvard
          ? "space-y-1 pb-4 border-b border-slate-900 mb-6 font-serif"
          : "space-y-3 pb-8 border-b-2 border-slate-100 mb-8 font-sans"
      }`}
    >
      {/* 1. HỌ TÊN */}
      <div className="w-full px-8 max-w-5xl mx-auto overflow-hidden">
        {isPreview ? (
          <h1
            className={`uppercase break-words leading-[1.1] ${
              isHarvard
                ? "text-3xl font-bold text-black"
                : "text-4xl font-black text-slate-800 tracking-tight"
            }`}
          >
            {safeClean(displayFullName, "HỌ TÊN CỦA BẠN")}
          </h1>
        ) : (
          <InlineRichText
            value={displayFullName}
            // VẤN ĐỀ 2 ĐÃ SỬA: Truyền tham số dạng Object để khớp với chuẩn Zustand
            onChange={(val: string) => updatePersonalInfo({ fullName: val })}
            className={`uppercase break-words leading-[1.1] outline-none w-full text-center ${
              isHarvard
                ? "text-3xl font-bold text-black"
                : "text-4xl font-black text-slate-800 tracking-tight"
            }`}
            placeholder="HỌ TÊN CỦA BẠN"
          />
        )}
      </div>

      {/* 2. VỊ TRÍ ỨNG TUYỂN */}
      {!isHarvard && (
        <div className="w-full px-4 overflow-hidden">
          <div style={{ color: primaryColor }}>
            <InlineRichText
              value={info.title || ""}
              onChange={(val: string) => updatePersonalInfo({ title: val })}
              className="text-lg font-bold uppercase tracking-[0.2em] outline-none w-full text-center break-words"
              placeholder="VỊ TRÍ ỨNG TUYỂN"
            />
          </div>
        </div>
      )}

      {/* 3. THÔNG TIN LIÊN HỆ */}
      <div
        className={`flex flex-wrap justify-center items-center mt-2 w-full px-4 max-w-4xl mx-auto ${
          isHarvard
            ? "gap-x-3 gap-y-1 text-[12px] text-black font-medium"
            : "gap-x-6 gap-y-2 text-[13px] text-slate-600"
        }`}
      >
        <ContactItem
          icon={
            !isHarvard && <Phone size={13} style={{ color: primaryColor }} />
          }
          value={info.phone}
          placeholder="Số điện thoại"
          onChange={(val) => updatePersonalInfo({ phone: val })}
          isPreview={isPreview}
          isHarvard={isHarvard}
        />

        <Separator isHarvard={isHarvard} />

        <ContactItem
          icon={
            !isHarvard && <Mail size={13} style={{ color: primaryColor }} />
          }
          value={info.email}
          placeholder="Email"
          onChange={(val) => updatePersonalInfo({ email: val })}
          isPreview={isPreview}
          isHarvard={isHarvard}
        />

        <Separator isHarvard={isHarvard} />

        <ContactItem
          icon={
            !isHarvard && <MapPin size={13} style={{ color: primaryColor }} />
          }
          value={info.address}
          placeholder="Địa chỉ"
          onChange={(val) => updatePersonalInfo({ address: val })}
          isPreview={isPreview}
          isHarvard={isHarvard}
        />

        {info.website && (
          <>
            <Separator isHarvard={isHarvard} />
            <ContactItem
              icon={
                !isHarvard && (
                  <Globe size={13} style={{ color: primaryColor }} />
                )
              }
              value={info.website}
              placeholder="LinkedIn/Portfolio"
              onChange={(val) => updatePersonalInfo({ website: val })}
              isPreview={isPreview}
              isHarvard={isHarvard}
            />
          </>
        )}
      </div>
    </header>
  );
};

const Separator = ({ isHarvard }: { isHarvard: boolean }) =>
  isHarvard ? <span className="text-slate-400 select-none">|</span> : null;

interface ContactItemProps {
  icon: React.ReactNode | false;
  value?: string;
  placeholder: string;
  onChange: (val: string) => void;
  isPreview: boolean;
  isHarvard: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  value,
  placeholder,
  onChange,
  isPreview,
  isHarvard,
}) => (
  <div className="flex items-center gap-1.5 max-w-[250px]">
    {icon && <span className="shrink-0">{icon}</span>}
    {isPreview ? (
      <span className="truncate">{safeClean(value, placeholder)}</span>
    ) : (
      <InlineRichText
        value={value || ""}
        onChange={onChange}
        className={`bg-transparent outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-300 transition-all truncate min-w-[50px] ${
          isHarvard ? "text-center" : ""
        }`}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default HeaderBlock;
