import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { cvService } from "../../../services/cvService";
import { CvLayoutData } from "../../../types/cv";
import HeaderBlock from "../components/HeaderBlock";

const PreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<CvLayoutData | null>(null);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  /**
   * 1. LÀM SẠCH HTML: Xử lý triệt để các thẻ rác lọt vào từ Editor.
   * Đảm bảo layout in ấn không bị vỡ do thẻ <p> thừa.
   */
  const safeCleanHTML = (html: string | undefined) => {
    if (!html) return "";
    return html
      .replace(/<p[^>]*>/g, "") // Loại bỏ thẻ mở p
      .replace(/<\/p>/g, "") // Loại bỏ thẻ đóng p
      .replace(/&lt;p&gt;|<p>/g, "") // Fix trường hợp bị encode từ backend
      .replace(/&lt;\/p&gt;|<\/p>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  /**
   * 2. TRÍCH XUẤT TEXT THUẦN: Dùng cho document.title và Header.
   * Khắc phục lỗi tên PDF bị dính thẻ <p>.
   */
  const extractRawText = (html: string | undefined) => {
    if (!html) return "";
    return html.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };

  useEffect(() => {
    const loadFreshData = async () => {
      if (!id) return;

      // Xử lý token từ URL (nếu có) để duy trì session cho Headless Chrome
      const token = searchParams.get("t");
      if (token) {
        localStorage.setItem("career-compass-token", token);
      }

      try {
        // RESET: Báo hiệu cho Backend Rust là chưa sẵn sàng
        (window as any).isRendered = false;

        const response = await cvService.getById(id);

        if (response && response.layout_data) {
          const layout = response.layout_data;
          setData(layout);

          // FIX: Gỡ bỏ hoàn toàn HTML khỏi tiêu đề trang
          const fullName = extractRawText(layout.personalInfo?.fullName);
          document.title = fullName ? `CV - ${fullName}` : "CV Preview";

          // 3. CƠ CHẾ ĐỢI RENDER (Đồng bộ với PdfService.rs)
          // Đợi Fonts tải xong để tránh PDF bị lỗi font/trắng trang
          setTimeout(() => {
            if (document.fonts) {
              document.fonts.ready.then(() => {
                setIsReady(true);
                (window as any).isRendered = true; // Bật công tắc cho Rust bắt đầu in
              });
            } else {
              setIsReady(true);
              (window as any).isRendered = true;
            }
          }, 800);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("🔥 Lỗi fetch CV preview:", err);
        setError(true);
      }
    };

    loadFreshData();
  }, [id, searchParams]);

  if (error) {
    return (
      <div className="p-10 text-red-500 text-center font-bold">
        Không thể tải dữ liệu CV. Vui lòng kiểm tra kết nối Backend.
      </div>
    );
  }

  if (!data) return null;

  const themeColor = data.theme?.primaryColor || "#4f46e5";

  return (
    <div
      className={`bg-white min-h-screen p-0 m-0 print-container ${
        !isReady ? "opacity-0" : "opacity-100 transition-opacity duration-300"
      }`}
      id="cv-preview"
      style={{
        fontFamily: data.theme?.fontFamily || "'Inter', sans-serif",
        lineHeight: data.theme?.lineHeight || 1.5,
      }}
    >
      {/* 4. Truyền dữ liệu SẠCH vào Header để tên không bị dính <p> */}
      <HeaderBlock
        personalInfo={{
          ...data.personalInfo,
          fullName: extractRawText(data.personalInfo?.fullName),
          title: extractRawText(data.personalInfo?.title),
        }}
        theme={data.theme}
        isPreview={true}
      />

      <div className="px-12 py-6">
        <div className="space-y-6">
          {data.sections
            ?.filter(
              (s) =>
                s.visible &&
                s.type.toLowerCase() !== "header" &&
                (s.content || (s.items && s.items.length > 0)),
            )
            .map((section) => (
              <div
                key={section.id}
                className="cv-section-item break-inside-avoid"
              >
                <h3
                  className="text-[16px] font-black uppercase mb-3 pb-1 border-b-2 tracking-widest"
                  style={{
                    color: themeColor,
                    borderColor: themeColor,
                  }}
                >
                  {section.title}
                </h3>

                {section.content && (
                  <div
                    className="text-slate-700 leading-relaxed text-[13px] mb-4 text-justify preview-rich-text"
                    dangerouslySetInnerHTML={{
                      __html: safeCleanHTML(section.content),
                    }}
                  />
                )}

                {section.items && section.items.length > 0 && (
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="break-inside-avoid">
                        <div className="flex justify-between items-start font-bold text-slate-900">
                          <span className="text-[14px] uppercase flex-1">
                            {extractRawText(item.title)}
                          </span>
                          <span className="text-slate-500 text-[11px] font-medium ml-4 shrink-0">
                            {item.date}
                          </span>
                        </div>

                        {item.subtitle && (
                          <div className="text-indigo-600 font-bold text-[12px] mb-1">
                            {extractRawText(item.subtitle)}
                          </div>
                        )}

                        {item.description && (
                          <div
                            className="text-slate-600 text-[13px] mt-1 leading-relaxed text-justify preview-rich-text"
                            dangerouslySetInnerHTML={{
                              __html: safeCleanHTML(item.description),
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #cv-preview {
            width: 210mm;
            min-height: 297mm;
            padding: 0;
            margin: 0;
          }
        }

        /* Loại bỏ margin thừa do thẻ p trong Rich Text tạo ra */
        .preview-rich-text p {
          margin: 0 !important;
          display: inline;
        }

        .break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .preview-rich-text {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      `}</style>
    </div>
  );
};

export default PreviewPage;
