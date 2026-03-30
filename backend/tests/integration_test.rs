use axum::{
    body::Body,
    http::{self, Request, StatusCode},
    routing::post,
    Router,
};
use http_body_util::BodyExt;
use serde_json::{json, Value};
use tower::ServiceExt; // Cung cấp hàm `oneshot` thần thánh

#[cfg(test)]
mod integration_tests {
    use super::*;

    // 1. Hàm tạo App dùng chung cho các Test Cases
    // Trong thực tế, bạn có thể import Router chính từ src/lib.rs
    fn app(is_fallback: bool) -> Router {
        Router::new().route(
            "/api/v1/scoring/score-cv",
            post(move |_req: Request<Body>| async move {
                let response = if is_fallback {
                    // Kịch bản: NLP Service bị lỗi, trả về điểm Baseline
                    json!({
                        "status": "success",
                        "data": {
                            "score": 40.0,
                            "note": "calculated_by_baseline_engine"
                        }
                    })
                } else {
                    // Kịch bản: Chạy bình thường (Happy Path)
                    json!({
                        "status": "success",
                        "data": {
                            "score": 75.5,
                            "match_level": "Good"
                        }
                    })
                };
                axum::Json(response)
            }),
        )
    }

    // TEST CASE 1: Kiểm tra định dạng Envelope chuẩn (Happy Path)
    #[tokio::test]
    async fn test_scoring_api_returns_envelope_format() {
        // --- ARRANGE ---
        let router = app(false);
        let payload = json!({
            "cv_text": "Rust dev with Axum and Tokio",
            "jd_text": "Need Rust dev for backend"
        });

        let request = Request::builder()
            .uri("/api/v1/scoring/score-cv")
            .method(http::Method::POST)
            .header(http::header::CONTENT_TYPE, "application/json")
            .body(Body::from(payload.to_string()))
            .unwrap();

        // --- ACT ---
        let response = router.oneshot(request).await.unwrap();

        // --- ASSERT ---
        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body_json: Value = serde_json::from_slice(&body).unwrap();

        // Kiểm tra cấu trúc Envelope
        assert_eq!(body_json["status"], "success");
        assert!(body_json.get("data").is_some());
        assert_eq!(body_json["data"]["score"], 75.5);
    }

    // TEST CASE 2: Kiểm tra khả năng chịu lỗi (Resilience/Fallback)
    #[tokio::test]
    async fn test_scoring_api_fallback_when_nlp_down() {
        // --- ARRANGE ---
        let router = app(true); // Kích hoạt giả lập lỗi NLP
        let payload = json!({
            "cv_text": "Rust developer",
            "jd_text": "Looking for Rust developer"
        });

        let request = Request::builder()
            .uri("/api/v1/scoring/score-cv")
            .method(http::Method::POST)
            .header(http::header::CONTENT_TYPE, "application/json")
            .body(Body::from(payload.to_string()))
            .unwrap();

        // --- ACT ---
        let response = router.oneshot(request).await.unwrap();

        // --- ASSERT ---
        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body_json: Value = serde_json::from_slice(&body).unwrap();

        // Xác nhận hệ thống tự động dùng cơ chế dự phòng
        assert_eq!(body_json["data"]["note"], "calculated_by_baseline_engine");
        assert_eq!(body_json["data"]["score"], 40.0);
    }
}
