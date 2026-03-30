use crate::{
    modules::ai::{
        gemini_client,
        // Giả sử hàm này nằm trong handlers hoặc baseline, ta cần import nó vào scope này
        handlers::calculate_baseline_score,
        models::{ChatAssistantResponse, ChatMessage},
        prompt_templates,
    },
    shared::{api_error::ApiError, app_state::AppState},
};

/// Xử lý hội thoại với trợ lý AI dựa trên ngữ cảnh CV và JD
pub async fn chat_assistant(
    state: &AppState,
    message: &str,
    language: &str,
    jd_text: Option<&str>,
    cv_summary: Option<&str>,
    history: Option<&[ChatMessage]>,
) -> Result<ChatAssistantResponse, ApiError> {
    // Lấy 8 tin nhắn gần nhất để làm ngữ cảnh cho AI
    let history_lines = history
        .unwrap_or(&[])
        .iter()
        .rev()
        .take(8)
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .map(|item| format!("{}: {}", item.role, item.content))
        .collect::<Vec<_>>();

    let prompt = prompt_templates::chat_assistant_prompt(
        message,
        language,
        jd_text,
        cv_summary,
        &history_lines,
    );

    let reply = gemini_client::generate_text(state, prompt).await?;

    Ok(ChatAssistantResponse {
        reply: reply.trim().to_string(),
    })
}

// =================================================================
// UNIT TESTS - GIAI ĐOẠN 1: BOUNDARY ANALYSIS
// =================================================================
#[cfg(test)]
mod tests {
    // Dòng này giúp module con 'tests' thấy được hàm calculate_baseline_score
    // đã được import ở đầu file.
    use super::*;

    #[test]
    fn test_calculate_baseline_score_boundaries() {
        // 1. Định nghĩa bảng dữ liệu test (Table-Driven Tests)
        struct TestCase {
            name: &'static str,
            cv_text: &'static str,
            jd_text: &'static str,
            expected_min: f64,
        }

        let test_cases = vec![
            TestCase {
                name: "Biên dưới: Chuỗi rỗng hoàn toàn",
                cv_text: "",
                jd_text: "",
                expected_min: 0.0,
            },
            TestCase {
                name: "Biên dưới: CV chỉ có 1 ký tự",
                cv_text: "A",
                jd_text: "Software Engineer",
                expected_min: 0.0,
            },
            TestCase {
                name: "Dữ liệu rác: Toàn ký tự đặc biệt",
                cv_text: "!@#$%^&*()_+",
                jd_text: "Rust Developer",
                expected_min: 0.0,
            },
            TestCase {
                name: "Dữ liệu khớp hoàn toàn: Trường hợp lý tưởng",
                cv_text: "Rust Python React TypeScript Axum",
                jd_text: "Rust Python React TypeScript Axum",
                expected_min: 40.0,
            },
            TestCase {
                name: "Dữ liệu không liên quan: Điểm thấp",
                cv_text: "Kế toán trưởng chuyên nghiệp",
                jd_text: "Embedded C++ Engineer",
                expected_min: 0.0,
            },
        ];

        // 2. Chạy qua từng trường hợp kiểm thử
        for tc in test_cases {
            let score = calculate_baseline_score(tc.cv_text, tc.jd_text);

            assert!(
                score >= tc.expected_min,
                "FAILED [{}] - Score nhận được: {} (Kỳ vọng >= {})",
                tc.name,
                score,
                tc.expected_min
            );
        }
    }
}
