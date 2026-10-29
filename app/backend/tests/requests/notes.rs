use backend::{app::App, views::notes::NoteResponse};
use loco_rs::testing::prelude::*;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn can_crud_notes() {
    request::<App, _, _>(|request, _ctx| async move {
        // 1. Initially empty
        let list_res = request.get("/api/notes").await;
        assert_eq!(list_res.status_code(), 200);
        let initial: Vec<NoteResponse> = serde_json::from_str(&list_res.text()).unwrap();
        assert!(initial.is_empty());

        // 2. Create a note
        let create_res = request
            .post("/api/notes")
            .json(&serde_json::json!({
                "title": "A+B Problem",
                "platform": "beecrowd",
                "problem_ref": "1001",
                "content": "# Solution\nRead two integers and print `A + B`.",
                "tags": "math,beginner"
            }))
            .await;
        assert_eq!(create_res.status_code(), 201);
        let created: NoteResponse = serde_json::from_str(&create_res.text()).unwrap();
        assert_eq!(created.title, "A+B Problem");
        assert_eq!(created.status, "open");

        // 3. Get single note
        let get_res = request.get(&format!("/api/notes/{}", created.id)).await;
        assert_eq!(get_res.status_code(), 200);
        let fetched: NoteResponse = serde_json::from_str(&get_res.text()).unwrap();
        assert_eq!(fetched.id, created.id);
        assert_eq!(fetched.platform.as_deref(), Some("beecrowd"));

        // 4. Update note
        let update_res = request
            .put(&format!("/api/notes/{}", created.id))
            .json(&serde_json::json!({
                "title": "A+B Problem (Updated)",
                "status": "solved"
            }))
            .await;
        assert_eq!(update_res.status_code(), 200);
        let updated: NoteResponse = serde_json::from_str(&update_res.text()).unwrap();
        assert_eq!(updated.title, "A+B Problem (Updated)");
        assert_eq!(updated.status, "solved");

        // 5. Delete note
        let del_res = request.delete(&format!("/api/notes/{}", created.id)).await;
        assert_eq!(del_res.status_code(), 200);

        // 6. Verify 404 after delete
        let after_del = request.get(&format!("/api/notes/{}", created.id)).await;
        assert_eq!(after_del.status_code(), 404);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn rejects_invalid_note_payloads() {
    request::<App, _, _>(|request, _ctx| async move {
        // Empty title
        let empty_title = request
            .post("/api/notes")
            .json(&serde_json::json!({
                "title": "",
                "content": "Some markdown"
            }))
            .await;
        assert_eq!(empty_title.status_code(), 400);

        // Empty content
        let empty_content = request
            .post("/api/notes")
            .json(&serde_json::json!({
                "title": "Valid Title",
                "content": "   "
            }))
            .await;
        assert_eq!(empty_content.status_code(), 400);

        // Invalid status
        let bad_status = request
            .post("/api/notes")
            .json(&serde_json::json!({
                "title": "Valid Title",
                "content": "Valid content",
                "status": "invalid-status"
            }))
            .await;
        assert_eq!(bad_status.status_code(), 400);
    })
    .await;
}
