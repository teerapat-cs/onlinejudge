use loco_rs::prelude::*;
use sea_orm::QueryOrder;

pub use super::_entities::algorithms::{self, ActiveModel, Entity, Model};
pub type Algorithms = Entity;

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

impl Model {
    /// Lists all algorithms ordered by primary key ascending.
    ///
    /// # Errors
    ///
    /// Returns a `ModelError` when the database query fails.
    pub async fn list_all(db: &DatabaseConnection) -> ModelResult<Vec<Self>> {
        algorithms::Entity::find()
            .order_by_asc(algorithms::Column::Id)
            .all(db)
            .await
            .map_err(ModelError::from)
    }

    /// Finds an algorithm by its unique slug.
    ///
    /// # Errors
    ///
    /// Returns `ModelError::EntityNotFound` if no algorithm with the given slug exists.
    pub async fn find_by_slug(db: &DatabaseConnection, slug: &str) -> ModelResult<Self> {
        algorithms::Entity::find()
            .filter(
                model::query::condition()
                    .eq(algorithms::Column::Slug, slug)
                    .build(),
            )
            .one(db)
            .await?
            .ok_or_else(|| ModelError::EntityNotFound)
    }
}

impl ActiveModel {}

impl Entity {}
