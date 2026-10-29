use backend::{app::App, views::algorithms::AlgorithmResponse};
use loco_rs::testing::prelude::*;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn can_list_and_get_algorithms() {
    request::<App, _, _>(|request, ctx| async move {
        seed::<App>(&ctx).await.expect("seed should succeed");

        let res = request.get("/api/algorithms").await;
        assert_eq!(res.status_code(), 200);
        let list: Vec<AlgorithmResponse> = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(list.len(), 3);

        let bubble_res = request.get("/api/algorithms/bubble-sort").await;
        assert_eq!(bubble_res.status_code(), 200);
        let bubble: AlgorithmResponse = serde_json::from_str(&bubble_res.text()).unwrap();
        assert_eq!(bubble.slug, "bubble-sort");
        assert_eq!(bubble.category, "sorting");
        assert!(bubble.sample_input.is_some());

        let missing_res = request.get("/api/algorithms/non-existent").await;
        assert_eq!(missing_res.status_code(), 404);
    })
    .await;
}
