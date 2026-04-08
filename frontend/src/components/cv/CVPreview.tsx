import React, { forwardRef } from "react";
// Sửa đường dẫn lùi 2 cấp để vào đúng store
import { useCvStore } from "../../stores/useCvStore";
import { Loader2, AlertCircle } from "lucide-react";

// Import các Templates từ thư mục editor/templates
// Đảm bảo đường dẫn này khớp với cấu trúc: src/components/editor/templates/
import { StandardTemplate } from "../editor/templates/StandardTemplate";
import { HarvardTemplate } from "../editor/templates/HarvardTemplate";
import { HarvardTemplate02 } from "../editor/templates/HarvardTemplate02";

interface CVPreviewProps {}

const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>((_props, ref) => {
  const { data, isLoading, error } = useCvStore();

  // 1. Trạng thái Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-[21cm] mx-auto bg-white shadow-md rounded-xl border-2 border-dashed border-slate-200">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium italic">
          Đang chuẩn bị bản xem trước CV...
        </p>
      </div>
    );
  }

  // 2. Trạng thái Lỗi hoặc Thiếu dữ liệu
  if (error || !data || !data.sections) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-[21cm] mx-auto bg-white shadow-md border border-red-100 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">
          Lỗi hiển thị dữ liệu
        </h3>
        <p className="text-slate-500 text-sm mt-2">
          {error || "Không tìm thấy cấu trúc CV hợp lệ. Vui lòng thử lại."}
        </p>
      </div>
    );
  }

  /**
   * 3. LOGIC ĐIỀU PHỐI TEMPLATE
   * Khớp templateId từ Store với các Component tương ứng
   */
  const renderSelectedTemplate = () => {
    // Lấy templateId từ theme, mặc định là harvard-01 nếu chưa có
    const templateId = data.theme.templateId || "harvard-01";

    switch (templateId) {
      case "harvard-01":
        return <HarvardTemplate data={data} isPreview={true} />;
      case "harvard-02":
        return <HarvardTemplate02 data={data} isPreview={true} />;
      case "harvard":
      case "modern-01":
      case "standard-01":
      case "standard": // Hỗ trợ fallback nếu id cũ là standard
        return <StandardTemplate data={data} isPreview={true} />;
      default:
        // Nếu không khớp id nào, fallback về Harvard mặc định
        return <HarvardTemplate data={data} isPreview={true} />;
    }
  };

  return (
    <div
      id="cv-preview-container"
      ref={ref}
      className="cv-preview-wrapper transition-all duration-300 ease-in-out"
    >
      {/* Container chuẩn A4 để quản lý giao diện và in ấn */}
      <div
        className="mx-auto bg-white shadow-2xl"
        style={{
          width: "210mm",
          minHeight: "297mm",
          // Áp dụng các font chữ và màu sắc từ theme store
          fontFamily: data.theme.fontFamily || "Inter, sans-serif",
          fontSize: data.theme.fontSize || "14px",
          lineHeight: data.theme.lineHeight || 1.5,
        }}
      >
        {renderSelectedTemplate()}
      </div>

      {/* Global CSS cho Print Mode - Giúp xuất PDF chuẩn xác */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .cv-preview-wrapper { box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          @page {
            size: A4;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
});

CVPreview.displayName = "CVPreview";

export default CVPreview;
