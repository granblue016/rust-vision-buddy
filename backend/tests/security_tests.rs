use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::ServiceExt;
use uuid::Uuid;
// Import từ thư viện của bạn (career_compass_backend là tên trong Cargo.toml)
use career_compass_backend::{config::settings::Settings, create_app, shared::app_state::AppState};

#[tokio::test]
async fn test_idor_prevention_on_cv_access() {
    dotenvy::dotenv().ok();
    let settings = Settings::from_env().expect("Không load được config");
    let db_pool = career_compass_backend::shared::database::create_pool(&settings.database_url)
        .await
        .unwrap();

    let state = AppState::new(settings, db_pool);
    let app = create_app(state);

    let user_b_cv_id = Uuid::new_v4();
    let token_user_a = "Bearer mock_token_user_a";

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/v1/cvs/{}", user_b_cv_id))
                .header("Authorization", token_user_a)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert!(
        response.status() == StatusCode::FORBIDDEN
            || response.status() == StatusCode::UNAUTHORIZED
            || response.status() == StatusCode::NOT_FOUND
    );
}
