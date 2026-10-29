#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;

mod m20261029_042235_notes;
mod m20261029_042500_algorithms;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20261029_042235_notes::Migration),
            Box::new(m20261029_042500_algorithms::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}
