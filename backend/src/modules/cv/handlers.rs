use crate::modules::cv::models::{CreateCvRequest, Cv, CvLayoutData, CvResponse, UpdateCvRequest};
use crate::services::pdf_service::PdfService;
use crate::shared::app_state::AppState;
use axum::{
    extract::{Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use tracing::{error, info};
use uuid::Uuid;

/// 1. Tạo mới CV
pub async fn create_cv(
    State(state): State<AppState>,
    Json(payload): Json<CreateCvRequest>,
) -> Result<(StatusCode, Json<CvResponse>), StatusCode> {
    let user_id = Uuid::nil(); // TODO: Thay bằng ID từ JWT Auth khi hoàn thiện hệ thống User
    let cv_id = Uuid::new_v4();

    let mut default_layout = CvLayoutData::default();
    if let Some(tid) = payload.template_id {
        default_layout.theme.template_id = tid;
    }

    let layout_value = serde_json::to_value(&default_layout).map_err(|e| {
        error!("🔥 Serializing default layout failed: {:?}", e);
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
        error!("🔥 Database Insert Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    info!("✅ Created new CV: {} with name: {}", cv_id, payload.name);

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
        _ => {
            error!("🔥 DB Fetch Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    })?;

    Ok(Json(cv))
}

/// 3. Cập nhật CV (Tối ưu cho AUTO-SAVE)
pub async fn update_cv(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
    Json(payload): Json<UpdateCvRequest>,
) -> Result<StatusCode, StatusCode> {
    let target_id = Uuid::parse_str(&id_str).map_err(|_| StatusCode::BAD_REQUEST)?;

    info!(
        "💾 Auto-saving CV: {} - Title: {:?}",
        target_id, payload.name
    );

    let layout_value = serde_json::to_value(&payload.layout_data).map_err(|e| {
        error!("🔥 Serialization error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let result = sqlx::query!(
        r#"
        UPDATE cvs
        SET name = COALESCE($1, name),
            layout_data = $2,
            updated_at = NOW()
        WHERE id = $3
        "#,
        payload.name,
        layout_value,
        target_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        error!("🔥 Update CV SQL Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::OK)
}

/// 4. Xuất PDF - Tích hợp PdfService
pub async fn export_cv_pdf(
    State(_state): State<AppState>,
    headers: HeaderMap,
    Path(id_str): Path<String>,
) -> impl IntoResponse {
    // Trích xuất Token để PdfService có thể authenticate với Frontend Preview
    let token = headers
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .map(|s| s.replace("Bearer ", ""));

    // Lấy URL frontend từ Env (mặc định localhost:5173)
    let frontend_url =
        std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());

    let target_url = format!("{}/preview/{}", frontend_url, id_str);

    info!("🚀 Rendering PDF cho CV: {} - URL: {}", id_str, target_url);

    match PdfService::render_pdf(target_url, token).await {
        Ok(pdf_bytes) => {
            let filename = format!("CV_{}.pdf", id_str);

            // Xây dựng Header trả về file binary
            let mut res_headers = HeaderMap::new();
            res_headers.insert(
                header::CONTENT_TYPE,
                HeaderValue::from_static("application/pdf"),
            );
            res_headers.insert(
                header::CONTENT_DISPOSITION,
                HeaderValue::from_str(&format!("attachment; filename=\"{}\"", filename)).unwrap(),
            );
            // Quan trọng: Ngăn chặn trình duyệt cache file PDF cũ (lỗi image_8abe02.png)
            res_headers.insert(
                header::CACHE_CONTROL,
                HeaderValue::from_static("no-cache, no-store, must-revalidate"),
            );

            (StatusCode::OK, res_headers, pdf_bytes).into_response()
        }
        Err(status) => {
            error!("🔥 Export PDF failed with status: {:?}", status);
            (status, "Lỗi trong quá trình render PDF").into_response()
        }
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
