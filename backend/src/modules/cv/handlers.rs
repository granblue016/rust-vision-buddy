use crate::modules::cv::models::{
    CreateCvRequest, Cv, CvLayoutData, CvResponse, CvSection, CvTheme, UpdateCvRequest,
};
use crate::shared::app_state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

/// 1. Tạo mới một bản nháp CV với Layout mặc định
pub async fn create_cv(
    State(state): State<AppState>,
    Json(payload): Json<CreateCvRequest>,
) -> Result<(StatusCode, Json<CvResponse>), StatusCode> {
    let user_id = Uuid::nil(); // TODO: Lấy từ JWT Token sau này
    let cv_id = Uuid::new_v4();

    // Khởi tạo các Section mặc định để người dùng có cái để kéo thả ngay lập tức
    let default_sections = vec![
        CvSection {
            id: "header".into(),
            r#type: "header".into(),
            title: "Thông tin cá nhân".into(),
            visible: true,
            items: vec![],
        },
        CvSection {
            id: "summary".into(),
            r#type: "summary".into(),
            title: "Giới thiệu".into(),
            visible: true,
            items: vec![],
        },
        CvSection {
            id: "experience".into(),
            r#type: "experience".into(),
            title: "Kinh nghiệm làm việc".into(),
            visible: true,
            items: vec![],
        },
        CvSection {
            id: "education".into(),
            r#type: "education".into(),
            title: "Học vấn".into(),
            visible: true,
            items: vec![],
        },
        CvSection {
            id: "skills".into(),
            r#type: "skills".into(),
            title: "Kỹ năng".into(),
            visible: true,
            items: vec![],
        },
    ];

    let default_layout = CvLayoutData {
        template_id: payload
            .template_id
            .unwrap_or_else(|| "modern-01".to_string()),
        theme: CvTheme::default(),
        sections: default_sections,
    };

    let layout_json =
        serde_json::to_value(default_layout).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    sqlx::query!(
        r#"
        INSERT INTO cvs (id, user_id, name, layout_data)
        VALUES ($1, $2, $3, $4)
        "#,
        cv_id,
        user_id,
        payload.name,
        layout_json
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

/// 2. Lấy chi tiết một CV (Dữ liệu này sẽ được Lovable dùng để render Editor)
pub async fn get_cv_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Cv>, StatusCode> {
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

/// 3. Cập nhật Layout & Nội dung (API then chốt cho tính năng kéo thả)
pub async fn update_cv(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateCvRequest>,
) -> Result<StatusCode, StatusCode> {
    let layout_json =
        serde_json::to_value(payload.layout_data).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let result = sqlx::query!(
        r#"
        UPDATE cvs
        SET
            name = COALESCE($1, name),
            layout_data = $2,
            updated_at = NOW()
        WHERE id = $3
        "#,
        payload.name,
        layout_json,
        id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        eprintln!("🔥 Database Error (Update): {:?}", e);
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

/// 5. Xóa CV
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
