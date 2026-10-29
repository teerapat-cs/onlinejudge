use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "notes",
            &[
                ("id", ColType::PkAuto),
                ("title", ColType::String),
                ("platform", ColType::StringNull),
                ("problem_ref", ColType::StringNull),
                ("content", ColType::Text),
                ("tags", ColType::StringNull),
                ("status", ColType::StringWithDefault("open".to_string())),
            ],
            &[],
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "notes").await
    }
}
