use crate::modules::cv::models::{
    CreateCvRequest, Cv, CvLayoutData, CvResponse, CvTheme, UpdateCvRequest,
};
use crate::shared::app_state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

/// Tạo mới một bản nháp CV
pub async fn create_cv(
    State(state): State<AppState>,
    Json(payload): Json<CreateCvRequest>,
) -> Result<(StatusCode, Json<CvResponse>), StatusCode> {
    // Tạm thời dùng Uuid::nil() cho user_id.
    // LƯU Ý: Đảm bảo bảng 'users' có tồn tại bản ghi với ID này nếu migration có REFERENCES.
    let user_id = Uuid::nil();
    let cv_id = Uuid::new_v4();

    let default_layout = CvLayoutData {
        theme: CvTheme {
            font_family: "Inter".to_string(),
            font_size: "md".to_string(),
            line_height: 1.5,
            primary_color: "#2563eb".to_string(),
        },
        sections: vec![],
    };

    // Chuyển đổi sang sqlx::types::Json để khớp với macro query!
    let layout_json = sqlx::types::Json(default_layout);

    sqlx::query!(
        r#"
        INSERT INTO cvs (id, user_id, name, layout_data)
        VALUES ($1, $2, $3, $4)
        "#,
        cv_id,
        user_id,
        payload.name,
        serde_json::to_value(&layout_json).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        eprintln!("🔥 Database Error (Create): {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((
        StatusCode::CREATED,
        Json(CvResponse {
            id: cv_id,
            message: "Khởi tạo CV thành công".to_string(),
        }),
    ))
}

/// Lấy chi tiết một CV theo ID
pub async fn get_cv_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Cv>, StatusCode> {
    // Ép kiểu "layout_data" ngay trong SQL để SQLx map chính xác vào Struct
    let cv = sqlx::query_as!(
        Cv,
        r#"
        SELECT
            id,
            user_id,
            name,
            layout_data as "layout_data: sqlx::types::Json<CvLayoutData>",
            created_at,
            updated_at
        FROM cvs
        WHERE id = $1
        "#,
        id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => StatusCode::NOT_FOUND,
        _ => {
            eprintln!("🔥 Database Error (Get): {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    })?;

    Ok(Json(cv))
}

/// Cập nhật nội dung CV
pub async fn update_cv(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateCvRequest>,
) -> Result<StatusCode, StatusCode> {
    let layout_json = sqlx::types::Json(payload.layout_data);

    sqlx::query!(
        r#"
        UPDATE cvs
        SET
            name = COALESCE($1, name),
            layout_data = $2,
            updated_at = NOW()
        WHERE id = $3
        "#,
        payload.name,
        serde_json::to_value(&layout_json).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        eprintln!("🔥 Database Error (Update): {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(StatusCode::OK)
}

/// Liệt kê danh sách CV
pub async fn list_user_cvs(State(state): State<AppState>) -> Result<Json<Vec<Cv>>, StatusCode> {
    let cvs = sqlx::query_as!(
        Cv,
        r#"
        SELECT
            id,
            user_id,
            name,
            layout_data as "layout_data: sqlx::types::Json<CvLayoutData>",
            created_at,
            updated_at
        FROM cvs
        ORDER BY updated_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("🔥 Database Error (List): {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(cvs))
}

/// Xóa CV
pub async fn delete_cv(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query!("DELETE FROM cvs WHERE id = $1", id)
        .execute(&state.db)
        .await
        .map_err(|e| {
            eprintln!("🔥 Database Error (Delete): {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}
