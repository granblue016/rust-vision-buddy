import React from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { InlineRichText } from "./InlineRichText";
import { useCvStore } from "@/stores/useCvStore";

export const HeaderBlock: React.FC = () => {
  // Lấy dữ liệu và hàm cập nhật từ zustand store
  const data = useCvStore((state) => state.data);
  const updatePersonalInfo = useCvStore((state) => state.updatePersonalInfo);

  // Đảm bảo có fallback data để không bị trắng màn hình nếu dữ liệu load chậm
  const { personalInfo } = data;

  return (
    <div className="flex flex-col items-center text-center space-y-4 pb-8 border-b-2 border-slate-100 mb-8">
      {/* 1. HỌ TÊN - Ưu tiên hiển thị to, rõ ràng nhất */}
      <div className="w-full px-4">
        <InlineRichText
          value={personalInfo.fullName}
          onChange={(val) => updatePersonalInfo("fullName", val)}
          className="text-4xl font-black text-slate-800 uppercase tracking-tight leading-tight outline-none focus:ring-1 focus:ring-indigo-200 rounded-sm transition-all"
          placeholder="HỌ TÊN CỦA BẠN"
        />
      </div>

      {/* 2. VỊ TRÍ ỨNG TUYỂN - Dùng màu Primary để tạo điểm nhấn */}
      <div className="w-full px-4">
        <InlineRichText
          value={personalInfo.title}
          onChange={(val) => updatePersonalInfo("title", val)}
          className="text-lg font-bold text-indigo-600 uppercase tracking-[0.2em] outline-none focus:ring-1 focus:ring-indigo-100 rounded-sm transition-all"
          placeholder="VỊ TRÍ ỨNG TUYỂN"
        />
      </div>

      {/* 3. THÔNG TIN LIÊN HỆ (Grid/Flex Row) */}
      <div className="flex flex-wrap justify-center items-center gap-y-3 gap-x-8 mt-4 text-[13px] text-slate-600 max-w-4xl">
        {/* Số điện thoại */}
        <div className="flex items-center gap-2 group/info cursor-text">
          <div className="p-1 rounded-full bg-slate-50 group-hover/info:bg-indigo-50 transition-colors">
            <Phone size={14} className="text-indigo-500" />
          </div>
          <InlineRichText
            value={personalInfo.phone}
            onChange={(val) => updatePersonalInfo("phone", val)}
            className="min-w-[80px] border-b border-transparent hover:border-slate-300 focus:border-indigo-400"
            placeholder="Số điện thoại"
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 group/info cursor-text">
          <div className="p-1 rounded-full bg-slate-50 group-hover/info:bg-indigo-50 transition-colors">
            <Mail size={14} className="text-indigo-500" />
          </div>
          <InlineRichText
            value={personalInfo.email}
            onChange={(val) => updatePersonalInfo("email", val)}
            className="min-w-[120px] border-b border-transparent hover:border-slate-300 focus:border-indigo-400"
            placeholder="Email liên hệ"
          />
        </div>

        {/* Địa chỉ */}
        <div className="flex items-center gap-2 group/info cursor-text">
          <div className="p-1 rounded-full bg-slate-50 group-hover/info:bg-indigo-50 transition-colors">
            <MapPin size={14} className="text-indigo-500" />
          </div>
          <InlineRichText
            value={personalInfo.address}
            onChange={(val) => updatePersonalInfo("address", val)}
            className="min-w-[100px] border-b border-transparent hover:border-slate-300 focus:border-indigo-400"
            placeholder="Địa chỉ"
          />
        </div>

        {/* Website / LinkedIn */}
        <div className="flex items-center gap-2 group/info cursor-text">
          <div className="p-1 rounded-full bg-slate-50 group-hover/info:bg-indigo-50 transition-colors">
            <Globe size={14} className="text-indigo-500" />
          </div>
          <InlineRichText
            value={personalInfo.website}
            onChange={(val) => updatePersonalInfo("website", val)}
            className="min-w-[100px] border-b border-transparent hover:border-slate-300 focus:border-indigo-400"
            placeholder="Website/LinkedIn"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderBlock;
