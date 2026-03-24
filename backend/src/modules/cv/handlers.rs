use crate::modules::cv::models::{CreateCvRequest, Cv, CvLayoutData, CvResponse, UpdateCvRequest};
use crate::shared::app_state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use tracing::{error, info};
use uuid::Uuid;

/// 1. Tạo mới CV
pub async fn create_cv(
    State(state): State<AppState>,
    Json(payload): Json<CreateCvRequest>,
) -> Result<(StatusCode, Json<CvResponse>), StatusCode> {
    let user_id = Uuid::nil(); // Tạm thời dùng UUID trống cho demo
    let cv_id = Uuid::new_v4();

    // Khởi tạo layout mặc định
    let mut default_layout = CvLayoutData::default();
    if let Some(tid) = payload.template_id {
        default_layout.template_id = tid;
    }

    // Chuyển đổi sang serde_json::Value để sqlx có thể insert vào cột JSONB
    let layout_value =
        serde_json::to_value(&default_layout).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

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

    info!("✅ Created new CV: {} for user: {}", cv_id, user_id);

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
    let target_id = Uuid::parse_str(&id_str).map_err(|_| {
        error!("❌ Invalid UUID format: {}", id_str);
        StatusCode::BAD_REQUEST
    })?;

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
        sqlx::Error::RowNotFound => {
            error!("🔍 CV not found: {}", target_id);
            StatusCode::NOT_FOUND
        }
        _ => {
            error!("🔥 DB Fetch Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
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

    // Chuyển đổi layout_data sang Value để update vào DB
    let layout_value = serde_json::to_value(&payload.layout_data)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

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
        error!("🔥 Update CV Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::OK)
}

/// 4. Danh sách CV của người dùng
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
        error!("🔥 List CVs Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(cvs))
}

/// 5. Xóa CV
pub async fn delete_cv(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let target_id = Uuid::parse_str(&id_str).map_err(|_| StatusCode::BAD_REQUEST)?;

    let result = sqlx::query!("DELETE FROM cvs WHERE id = $1", target_id)
        .execute(&state.db)
        .await
        .map_err(|e| {
            error!("🔥 Delete CV Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}
