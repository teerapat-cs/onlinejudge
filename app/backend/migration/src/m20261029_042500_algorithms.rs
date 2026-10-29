use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "algorithms",
            &[
                ("id", ColType::PkAuto),
                ("slug", ColType::StringUniq),
                ("name", ColType::String),
                ("category", ColType::String),
                ("description", ColType::TextNull),
                ("pseudocode", ColType::TextNull),
                ("time_complexity", ColType::StringNull),
                ("space_complexity", ColType::StringNull),
                ("sample_input", ColType::JsonBinaryNull),
            ],
            &[],
        )
        .await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "algorithms").await
    }
}
