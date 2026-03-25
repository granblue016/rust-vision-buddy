use axum::http::StatusCode;
use headless_chrome::{
    browser::tab::Tab, protocol::cdp::Network, types::PrintToPdfOptions, Browser, LaunchOptions,
};
use std::ffi::OsStr;
use std::sync::Arc;
use std::time::Duration;
use tracing::{error, info};

pub struct PdfService;

impl PdfService {
    /// Render PDF với cơ chế đợi React Render hoàn tất (isRendered)
    pub async fn render_pdf(
        target_url: String,
        token: Option<String>,
    ) -> Result<Vec<u8>, StatusCode> {
        info!("🚀 Khởi tạo Headless Browser để in PDF: {}", target_url);

        let render_task = tokio::task::spawn_blocking(move || -> Result<Vec<u8>, StatusCode> {
            // 1. Cấu hình Chrome chuyên dụng (Thêm các args chống treo trên VPS)
            let options = LaunchOptions::default_builder()
                .window_size(Some((1200, 1600)))
                .headless(true)
                .args(vec![
                    OsStr::new("--no-sandbox"),
                    OsStr::new("--disable-setuid-sandbox"),
                    OsStr::new("--disable-dev-shm-usage"),
                    OsStr::new("--disable-gpu"),
                    OsStr::new("--hide-scrollbars"),
                    OsStr::new("--font-render-hinting=none"),
                ])
                .build()
                .map_err(|e| {
                    error!("🔥 Lỗi cấu hình Chrome: {:?}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            let browser = Browser::new(options).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let tab = browser.new_tab().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            Self::disable_browser_cache(&tab)?;

            // 2. Điều hướng và Xác thực qua LocalStorage
            tab.navigate_to(&target_url).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            if let Some(t) = token {
                let auth_script = format!(
                    "localStorage.setItem('auth_token', '{}'); \
                     localStorage.setItem('cv_rendering', 'true'); \
                     location.reload();",
                    t
                );
                tab.evaluate(&auth_script, true).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                tab.wait_until_navigated().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            }

            // 3. CRITICAL FIX: Đợi tín hiệu isRendered từ React (Tránh trắng trang)
            // Chúng ta đợi tối đa 10 giây cho đến khi window.isRendered trả về true
            let wait_script = r#"
                (() => {
                    return new Promise((resolve) => {
                        const check = () => {
                            if (window.isRendered === true) {
                                resolve(true);
                            } else {
                                setTimeout(check, 100);
                            }
                        };
                        check();
                        setTimeout(() => resolve(false), 10000); // Timeout sau 10s
                    });
                })()
            "#;

            let is_ready = tab.evaluate(wait_script, true)
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
                .value
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            if !is_ready {
                error!("🔥 Timeout: React không báo isRendered sau 10s");
                // Vẫn tiếp tục in nhưng log lỗi để biết lý do PDF có thể bị trắng
            }

            // 4. --- FAIL-SAFE CLEANUP (Chỉ xóa rác, không xóa dữ liệu thật) ---
            let fail_safe_cleanup = r#"
                (function() {
                    const runCleanup = () => {
                        // A. XỬ LÝ LỖI DÍNH THẺ <P> TRONG TEXT (Triệt để)
                        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                        let node;
                        while(node = walker.nextNode()) {
                            let val = node.nodeValue;
                            if (val.includes('<p>') || val.includes('&lt;p&gt;')) {
                                node.nodeValue = val
                                    .replace(/&lt;p&gt;|<p>/g, '')
                                    .replace(/&lt;\/p&gt;|<\/p>/g, '')
                                    .replace(/&nbsp;/g, ' ');
                            }
                        }

                        // B. LÀM SẠCH HEADER (Ép Tên/Chức danh về Text thuần)
                        document.querySelectorAll('h1, h2, .cv-name, .cv-title').forEach(el => {
                            if (el.innerHTML.includes('<')) {
                                el.innerText = el.innerText;
                            }
                        });

                        // C. CSS IN ẤN ĐẶC BIỆT
                        const style = document.createElement('style');
                        style.innerHTML = `
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            @page { margin: 0; size: auto; }
                            p:empty { display: none !important; }
                            .no-print { display: none !important; }
                        `;
                        document.head.appendChild(style);
                    };

                    runCleanup();
                    // Chạy lại sau 500ms để "thắng" các animation hoặc re-render cuối cùng
                    setTimeout(runCleanup, 500);
                })();
            "#;

            tab.evaluate(fail_safe_cleanup, true).map_err(|e| {
                error!("🔥 Lỗi thực thi Fail-safe Cleanup: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            // Nghỉ một chút để Font chữ và Image kịp load
            std::thread::sleep(Duration::from_millis(800));

            // 5. THÔNG SỐ IN CHUẨN A4 KHÔNG VIỀN (MARGIN: 0)
            let pdf_options = PrintToPdfOptions {
                print_background: Some(true),
                paper_width: Some(8.27),  // A4 Width in inches
                paper_height: Some(11.69), // A4 Height in inches
                margin_top: Some(0.0),
                margin_bottom: Some(0.0),
                margin_left: Some(0.0),
                margin_right: Some(0.0),
                display_header_footer: Some(false),
                prefer_css_page_size: Some(true),
                ..Default::default()
            };

            let pdf_data = tab.print_to_pdf(Some(pdf_options)).map_err(|e| {
                error!("🔥 Lỗi export PDF: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            Ok(pdf_data)
        })
        .await;

        match render_task {
            Ok(result) => result,
            Err(e) => {
                error!("🔥 Task vụ render bị treo hoặc crash: {:?}", e);
                Err(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }

    fn disable_browser_cache(tab: &Arc<Tab>) -> Result<(), StatusCode> {
        tab.call_method(Network::Enable {
            max_total_buffer_size: None,
            max_resource_buffer_size: None,
            max_post_data_size: None,
            report_direct_socket_traffic: Some(false),
            enable_durable_messages: Some(false),
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        tab.call_method(Network::SetCacheDisabled {
            cache_disabled: true,
        })
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        Ok(())
    }
}
