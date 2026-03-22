import React from "react";
import { useCvStore } from "@/stores/useCvStore"; // Đã có alias @
import ErrorBoundary from "@/shared/components/layout/ErrorBoundary";

/**
 * Component hiển thị bản xem trước của CV
 * Kết nối trực tiếp với Zustand Store để cập nhật thời gian thực
 */
const CVPreview: React.FC = () => {
  // Lấy dữ liệu và trạng thái từ Store
  const { data, isLoading, error } = useCvStore();

  // 1. Kiểm tra trạng thái tải dữ liệu để tránh render lỗi
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-20 text-slate-400">
        Đang chuẩn bị bản xem trước...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
        <p className="font-bold">Không thể hiển thị bản xem trước</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // 2. Trích xuất theme từ layout_data
  const { theme, sections } = data;

  // 3. Tạo style chung dựa trên cài đặt từ Database
  const containerStyle: React.CSSProperties = {
    fontFamily: theme.font_family,
    fontSize: theme.font_size,
    lineHeight: theme.line_height,
    color: "#333", // Màu chữ mặc định an toàn
  };

  return (
    <div
      className="bg-white shadow-2xl mx-auto my-8 p-12 min-h-[29.7cm] w-[21cm] transition-all duration-300"
      style={containerStyle}
    >
      {/* Bọc toàn bộ các Section bằng ErrorBoundary để tránh sập toàn bộ trang */}
      <ErrorBoundary>
        {sections.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-20 text-center text-slate-300">
            Kéo các mục từ thanh công cụ vào đây để bắt đầu xây dựng CV của bạn
          </div>
        ) : (
          <div className="space-y-8">
            {sections
              .filter((section) => section.visible) // Chỉ hiện những section được bật
              .map((section) => (
                <section
                  key={section.id}
                  className="relative group border-l-4 border-transparent hover:border-indigo-100 pl-4 transition-all"
                >
                  <h3
                    className="text-xl font-bold mb-4 uppercase tracking-wide"
                    style={{ color: theme.primary_color }} // Dùng màu chủ đạo từ Database
                  >
                    {section.title}
                  </h3>

                  {/* Phần render các Item bên trong Section */}
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="cv-item">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          <span className="text-sm text-slate-500 italic">
                            {item.date}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="text-slate-600 font-medium">
                            {item.subtitle}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default CVPreview;
