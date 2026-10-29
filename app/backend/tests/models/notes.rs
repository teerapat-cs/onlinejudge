use backend::{
    app::App,
    models::notes::{self, CreateNoteParams},
};
use loco_rs::testing::prelude::*;
use sea_orm::EntityTrait;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn can_query_notes() {
    let boot = boot_test::<App>().await.unwrap();
    seed::<App>(&boot.app_context).await.unwrap();

    let items = notes::Entity::find()
        .all(&boot.app_context.db)
        .await
        .expect("`notes` should be queryable");
    assert!(items.is_empty());
}

#[tokio::test]
#[serial]
async fn can_create_and_validate_note() {
    let boot = boot_test::<App>().await.unwrap();

    let created = notes::Model::create_note(
        &boot.app_context.db,
        &CreateNoteParams {
            title: "Two Sum".to_string(),
            platform: Some("leetcode".to_string()),
            problem_ref: Some("1".to_string()),
            content: "Use a hash map for O(n) lookup.".to_string(),
            tags: Some("array,hash-table".to_string()),
            status: None,
        },
    )
    .await
    .expect("valid note should be created");

    assert_eq!(created.title, "Two Sum");
    assert_eq!(created.status, "open");

    let empty_title = notes::Model::create_note(
        &boot.app_context.db,
        &CreateNoteParams {
            title: "   ".to_string(),
            platform: None,
            problem_ref: None,
            content: "valid content".to_string(),
            tags: None,
            status: Some("open".to_string()),
        },
    )
    .await;
    assert!(empty_title.is_err(), "blank title must fail validation");

    let invalid_status = notes::Model::create_note(
        &boot.app_context.db,
        &CreateNoteParams {
            title: "Valid title".to_string(),
            platform: None,
            problem_ref: None,
            content: "valid content".to_string(),
            tags: None,
            status: Some("archived".to_string()),
        },
    )
    .await;
    assert!(
        invalid_status.is_err(),
        "status outside open/solved/revisit must fail validation"
    );
}
