use crate::modules::cv::models::{
    CreateCvRequest, Cv, CvLayoutData, CvLayoutState, CvResponse, CvSection, CvSectionItem,
    CvTheme, PersonalInfo, UpdateCvRequest,
};
use crate::services::pdf_service::PdfService;
use crate::shared::app_state::AppState;
use axum::{
    extract::{Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::IntoResponse,
    Json,
};
use tracing::{error, info};
use uuid::Uuid;

pub async fn create_cv(
    State(state): State<AppState>,
    Json(payload): Json<CreateCvRequest>,
) -> Result<(StatusCode, Json<CvResponse>), StatusCode> {
    let user_id = Uuid::nil();
    let cv_id = Uuid::new_v4();

    // KHỞI TẠO DỮ LIỆU MẪU THEO ĐÚNG MODELS.RS
    let default_layout = CvLayoutData {
        template_id: payload
            .template_id
            .unwrap_or_else(|| "modern-01".to_string()),
        personal_info: PersonalInfo {
            full_name: "NGUYỄN VĂN ABCDEFFFG".into(),
            title: "FULLSTACK DEVELOPERRRRR".into(),
            email: "hello@gmail.com".into(),
            phone: "0123 456 789".into(),
            address: "TP. Hồ Chí Minh".into(),
            website: "github.com/nguyenvana".into(),
            avatar: None,
        },
        theme: CvTheme::default(),
        sections: vec![
            CvSection {
                id: "section-header".into(),
                r#type: "header".into(),
                title: "Thông tin cá nhân".into(),
                visible: true,
                ..Default::default()
            },
            CvSection {
                id: "section-skills".into(),
                r#type: "skills".into(),
                title: "Kỹ năng".into(),
                visible: true,
                items: vec![
                    CvSectionItem {
                        id: Uuid::new_v4().to_string(),
                        title: "React".into(),
                        ..Default::default()
                    },
                    CvSectionItem {
                        id: Uuid::new_v4().to_string(),
                        title: "Rust".into(),
                        ..Default::default()
                    },
                    CvSectionItem {
                        id: Uuid::new_v4().to_string(),
                        title: "Python".into(),
                        ..Default::default()
                    },
                ],
                ..Default::default()
            },
            CvSection {
                id: "section-summary".into(),
                r#type: "summary".into(),
                title: "Giới thiệu".into(),
                visible: true,
                content: Some("Đây là nội dung tóm tắt chuyên môn của tôi.".into()),
                ..Default::default()
            },
            CvSection {
                id: "section-exp".into(),
                r#type: "experience".into(),
                title: "Kinh nghiệm làm việc".into(),
                visible: true,
                items: vec![CvSectionItem {
                    id: Uuid::new_v4().to_string(),
                    title: "CÔNG TY ABC".into(),
                    subtitle: Some("Software Engineer".into()),
                    description: Some("Lập trình Rust/React".into()),
                    date: Some("2024 - Hiện tại".into()),
                    ..Default::default()
                }],
                ..Default::default()
            },
            CvSection {
                id: "section-edu".into(),
                r#type: "education".into(),
                title: "Học vấn".into(),
                visible: true,
                items: vec![CvSectionItem {
                    id: Uuid::new_v4().to_string(),
                    title: "ĐẠI HỌC CÔNG NGHỆ".into(),
                    subtitle: Some("Cử nhân CNTT".into()),
                    date: Some("2020 - 2024".into()),
                    ..Default::default()
                }],
                ..Default::default()
            },
        ],
        layout: CvLayoutState {
            full_width: vec!["section-header".into()],
            left_column: vec!["section-skills".into()],
            right_column: vec![
                "section-summary".into(),
                "section-exp".into(),
                "section-edu".into(),
            ],
            unused: vec![],
        },
    };

    let layout_value = serde_json::to_value(&default_layout).map_err(|e| {
        error!("🔥 Serialization failed: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    sqlx::query!(
        r#"INSERT INTO cvs (id, user_id, name, layout_data) VALUES ($1, $2, $3, $4)"#,
        cv_id,
        user_id,
        payload.name,
        layout_value
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        error!("🔥 DB Insert Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((
        StatusCode::CREATED,
        Json(CvResponse {
            id: cv_id,
            message: "Tạo CV thành công".into(),
        }),
    ))
}

/// 2. Lấy chi tiết CV theo ID
pub async fn get_cv_by_id(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
) -> Result<Json<Cv>, StatusCode> {
    let target_id = Uuid::parse_str(&id_str).map_err(|_| StatusCode::BAD_REQUEST)?;

    let cv = sqlx::query_as!(
        Cv,
        r#"SELECT id, user_id, name,
                  layout_data as "layout_data: sqlx::types::Json<CvLayoutData>",
                  created_at, updated_at
        FROM cvs WHERE id = $1"#,
        target_id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => StatusCode::NOT_FOUND,
        _ => StatusCode::INTERNAL_SERVER_ERROR,
    })?;

    Ok(Json(cv))
}

/// 3. Cập nhật CV
pub async fn update_cv(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
    Json(payload): Json<UpdateCvRequest>,
) -> Result<StatusCode, StatusCode> {
    let target_id = Uuid::parse_str(&id_str).map_err(|_| StatusCode::BAD_REQUEST)?;

    let layout_value = serde_json::to_value(&payload.layout_data).map_err(|e| {
        error!("🔥 Lỗi Serialize Update: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    sqlx::query!(
        r#"UPDATE cvs SET name = COALESCE($1, name), layout_data = $2, updated_at = NOW() WHERE id = $3"#,
        payload.name,
        layout_value,
        target_id
    )
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}

/// 4. Xuất PDF
pub async fn export_cv_pdf(
    State(_state): State<AppState>,
    headers: HeaderMap,
    Path(id_str): Path<String>,
) -> impl IntoResponse {
    let token = headers
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .map(|s| s.replace("Bearer ", ""));

    let frontend_url =
        std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let target_url = format!("{}/preview/{}", frontend_url, id_str);

    match PdfService::render_pdf(target_url, token).await {
        Ok(pdf_bytes) => {
            let filename = format!("CV_{}.pdf", id_str);
            let mut res_headers = HeaderMap::new();
            res_headers.insert(
                header::CONTENT_TYPE,
                HeaderValue::from_static("application/pdf"),
            );
            res_headers.insert(
                header::CONTENT_DISPOSITION,
                HeaderValue::from_str(&format!("attachment; filename=\"{}\"", filename)).unwrap(),
            );
            res_headers.insert(
                header::CACHE_CONTROL,
                HeaderValue::from_static("no-cache, no-store, must-revalidate"),
            );
            (StatusCode::OK, res_headers, pdf_bytes).into_response()
        }
        Err(status) => (status, "Lỗi render PDF").into_response(),
    }
}

/// 5. Danh sách CV
pub async fn list_user_cvs(State(state): State<AppState>) -> Result<Json<Vec<Cv>>, StatusCode> {
    let cvs = sqlx::query_as!(
        Cv,
        r#"SELECT id, user_id, name,
                  layout_data as "layout_data: sqlx::types::Json<CvLayoutData>",
                  created_at, updated_at
        FROM cvs
        ORDER BY updated_at DESC"#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        error!("🔥 List Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(cvs))
}

/// 6. Xóa CV
pub async fn delete_cv(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let target_id = Uuid::parse_str(&id_str).map_err(|_| StatusCode::BAD_REQUEST)?;

    let result = sqlx::query!("DELETE FROM cvs WHERE id = $1", target_id)
        .execute(&state.db)
        .await
        .map_err(|e| {
            error!("🔥 Delete Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}
