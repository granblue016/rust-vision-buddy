use crate::modules::cv::models::{
    CreateCvRequest, Cv, CvLayoutData, CvResponse, CvTheme, UpdateCvRequest,
};
use crate::shared::app_state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use tracing::error;
use uuid::Uuid;

/// 1. Tạo mới CV
/// Handler này nhận dữ liệu từ Frontend để tạo một bản ghi CV mới trong DB
pub async fn create_cv(
    State(state): State<AppState>,
    Json(payload): Json<CreateCvRequest>,
) -> Result<(StatusCode, Json<CvResponse>), StatusCode> {
    let user_id = Uuid::nil(); // Hiện tại dùng UUID mặc định cho user
    let cv_id = Uuid::new_v4();

    let default_layout = CvLayoutData {
        template_id: payload
            .template_id
            .unwrap_or_else(|| "modern-01".to_string()),
        theme: CvTheme::default(),
        sections: vec![], // Khởi tạo mảng rỗng theo migration
    };

    // Chuyển đổi Struct sang JSON để lưu vào Postgres JSONB
    let layout_json =
        serde_json::to_value(default_layout).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    sqlx::query!(
        r#"INSERT INTO cvs (id, user_id, name, layout_data) VALUES ($1, $2, $3, $4)"#,
        cv_id,
        user_id,
        payload.name,
        layout_json
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        error!("🔥 Database Error: {:?}", e);
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

/// 2. Lấy chi tiết CV - Giải quyết triệt để lỗi "UUID parsing failed"
/// Khi người dùng vào /editor/1, Path(id_str) sẽ nhận là "1" và trả về 400 thay vì lỗi 500
pub async fn get_cv_by_id(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
) -> Result<Json<Cv>, StatusCode> {
    // Kiểm tra tính hợp lệ của UUID. Tránh lỗi hiển thị trong ảnh image_5872a9.png
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
        sqlx::Error::RowNotFound => StatusCode::NOT_FOUND,
        _ => {
            error!("🔥 DB Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    })?;

    Ok(Json(cv))
}

/// 3. Cập nhật CV (PUT method)
pub async fn update_cv(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
    Json(payload): Json<UpdateCvRequest>,
) -> Result<StatusCode, StatusCode> {
    let target_id = Uuid::parse_str(&id_str).map_err(|_| StatusCode::BAD_REQUEST)?;

    let layout_json =
        serde_json::to_value(payload.layout_data).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let result = sqlx::query!(
        r#"UPDATE cvs SET name = COALESCE($1, name), layout_data = $2, updated_at = NOW() WHERE id = $3"#,
        payload.name,
        layout_json,
        target_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        error!("🔥 Update Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }
    Ok(StatusCode::OK)
}

/// 4. Liệt kê toàn bộ CV của user
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
            error!("🔥 Delete Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }
    Ok(StatusCode::NO_CONTENT)
}
