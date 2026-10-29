use backend::{app::App, models::algorithms};
use loco_rs::testing::prelude::*;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn can_query_seeded_algorithms() {
    let boot = boot_test::<App>().await.unwrap();
    seed::<App>(&boot.app_context).await.unwrap();

    let items = algorithms::Model::list_all(&boot.app_context.db)
        .await
        .expect("`algorithms` should be queryable");
    assert_eq!(items.len(), 3);

    let slugs: Vec<&str> = items.iter().map(|a| a.slug.as_str()).collect();
    assert_eq!(
        slugs,
        vec!["bubble-sort", "selection-sort", "binary-search"]
    );

    let bsearch = algorithms::Model::find_by_slug(&boot.app_context.db, "binary-search")
        .await
        .expect("binary-search should exist");
    assert_eq!(bsearch.name, "Binary Search");
    assert_eq!(bsearch.category, "searching");

    let missing = algorithms::Model::find_by_slug(&boot.app_context.db, "unknown-algo").await;
    assert!(missing.is_err());
}
