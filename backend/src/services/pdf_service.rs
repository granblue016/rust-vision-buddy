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
    pub async fn render_pdf(
        target_url: String,
        token: Option<String>,
    ) -> Result<Vec<u8>, StatusCode> {
        let final_url = if let Some(t) = token {
            format!("{}?t={}", target_url, t)
        } else {
            target_url
        };

        info!("🚀 Khởi tạo Headless Browser để in PDF: {}", final_url);

        let render_task = tokio::task::spawn_blocking(move || -> Result<Vec<u8>, StatusCode> {
            let options = LaunchOptions::default_builder()
                .window_size(Some((1200, 1600)))
                .headless(true)
                .args(vec![
                    OsStr::new("--no-sandbox"),
                    OsStr::new("--disable-setuid-sandbox"),
                    OsStr::new("--disable-dev-shm-usage"),
                    OsStr::new("--disable-gpu"),
                ])
                .build()
                .map_err(|e| {
                    error!("🔥 Lỗi cấu hình Chrome: {:?}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            let browser = Browser::new(options).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let tab = browser.new_tab().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            Self::disable_browser_cache(&tab)?;
            tab.navigate_to(&final_url).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            // FIX: Thay thế wait_for_condition bằng vòng lặp evaluate (Do headless-chrome bản này không hỗ trợ)
            let mut ready = false;
            for _ in 0..30 { // Đợi tối đa 15 giây (30 * 500ms)
                if let Ok(result) = tab.evaluate("window.isRendered === true", false) {
                    if result.value.and_then(|v| v.as_bool()).unwrap_or(false) {
                        ready = true;
                        break;
                    }
                }
                std::thread::sleep(Duration::from_millis(500));
            }

            if !ready {
                error!("🔥 Timeout: React không báo isRendered sau 15s");
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }

            // Cleanup rác HTML trước khi in
            let cleanup_script = r#"
                (function() {
                    document.querySelectorAll('h1, h2, .cv-name').forEach(el => el.innerText = el.innerText);
                    const style = document.createElement('style');
                    style.innerHTML = `
                        @page { margin: 0; size: A4; }
                        * { -webkit-print-color-adjust: exact !important; }
                    `;
                    document.head.appendChild(style);
                })();
            "#;
            tab.evaluate(cleanup_script, false).ok();

            std::thread::sleep(Duration::from_millis(1000));

            let pdf_options = PrintToPdfOptions {
                print_background: Some(true),
                paper_width: Some(8.27),
                paper_height: Some(11.69),
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

        render_task.unwrap_or(Err(StatusCode::INTERNAL_SERVER_ERROR))
    }

    fn disable_browser_cache(tab: &Arc<Tab>) -> Result<(), StatusCode> {
        tab.call_method(Network::Enable {
            max_total_buffer_size: None,
            max_resource_buffer_size: None,
            max_post_data_size: None,
            report_direct_socket_traffic: Some(false),
            enable_durable_messages: Some(false),
        })
        .ok();
        tab.call_method(Network::SetCacheDisabled {
            cache_disabled: true,
        })
        .ok();
        Ok(())
    }
}
