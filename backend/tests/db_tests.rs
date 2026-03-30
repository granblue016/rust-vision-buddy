use sqlx::PgPool;
use uuid::Uuid;

#[sqlx::test]
async fn test_cv_foreign_key_constraint(pool: PgPool) {
    // Thử tạo một CV với User ID ngẫu nhiên (chắc chắn không tồn tại)
    let random_user_id = Uuid::new_v4();

    let result = sqlx::query!(
        "INSERT INTO cvs (user_id, name) VALUES ($1, $2)",
        random_user_id,
        "CV Lỗi Ràng Buộc"
    )
    .execute(&pool)
    .await;

    // Kết quả mong đợi: Phải trả về lỗi vi phạm khóa ngoại
    assert!(result.is_err(), "Lẽ ra phải lỗi vì user_id không tồn tại");
}

#[sqlx::test]
async fn test_cascade_delete_cv_when_user_deleted(pool: PgPool) {
    // 1. Tạo một User mới
    let user_id = Uuid::new_v4();
    sqlx::query!(
        "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
        user_id,
        "test@example.com",
        "hash"
    )
    .execute(&pool)
    .await
    .unwrap();

    // 2. Tạo một CV cho User đó
    let cv_id = Uuid::new_v4();
    sqlx::query!(
        "INSERT INTO cvs (id, user_id, name) VALUES ($1, $2, $3)",
        cv_id,
        user_id,
        "CV Test Cascade"
    )
    .execute(&pool)
    .await
    .unwrap();

    // 3. Xóa User
    sqlx::query!("DELETE FROM users WHERE id = $1", user_id)
        .execute(&pool)
        .await
        .unwrap();

    // 4. Kiểm tra xem CV có còn tồn tại không
    let cv_exists = sqlx::query!("SELECT id FROM cvs WHERE id = $1", cv_id)
        .fetch_optional(&pool)
        .await
        .unwrap();

    assert!(
        cv_exists.is_none(),
        "CV lẽ ra phải bị xóa tự động theo User (Cascade)"
    );
}
