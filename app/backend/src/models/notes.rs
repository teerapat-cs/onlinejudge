use loco_rs::prelude::*;
use sea_orm::{ActiveValue, QueryOrder};
use serde::{Deserialize, Serialize};

pub use super::_entities::notes::{self, ActiveModel, Entity, Model};
pub type Notes = Entity;

pub const VALID_STATUSES: &[&str] = &["open", "solved", "revisit"];

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CreateNoteParams {
    pub title: String,
    pub platform: Option<String>,
    pub problem_ref: Option<String>,
    pub content: String,
    pub tags: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UpdateNoteParams {
    pub title: Option<String>,
    pub platform: Option<String>,
    pub problem_ref: Option<String>,
    pub content: Option<String>,
    pub tags: Option<String>,
    pub status: Option<String>,
}

fn validate_non_blank(val: &str) -> std::result::Result<(), validator::ValidationError> {
    if val.trim().is_empty() {
        return Err(validator::ValidationError::new("cannot_be_blank"));
    }
    Ok(())
}

fn validate_status(val: &str) -> std::result::Result<(), validator::ValidationError> {
    if VALID_STATUSES.contains(&val) {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_status"))
    }
}

fn active_str(val: &ActiveValue<String>) -> String {
    match val {
        ActiveValue::Set(v) | ActiveValue::Unchanged(v) => v.clone(),
        ActiveValue::NotSet => String::new(),
    }
}

#[derive(Debug, Validate, Deserialize)]
pub struct Validator {
    #[validate(
        length(min = 1, message = "Title cannot be empty."),
        custom(function = "validate_non_blank", message = "Title cannot be blank.")
    )]
    pub title: String,
    #[validate(
        length(min = 1, message = "Content cannot be empty."),
        custom(function = "validate_non_blank", message = "Content cannot be blank.")
    )]
    pub content: String,
    #[validate(custom(
        function = "validate_status",
        message = "Status must be one of: open, solved, revisit."
    ))]
    pub status: String,
}

impl Validatable for ActiveModel {
    fn validator(&self) -> Box<dyn Validate> {
        Box::new(Validator {
            title: active_str(&self.title),
            content: active_str(&self.content),
            status: active_str(&self.status),
        })
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        let mut this = self;
        if insert && matches!(this.status, ActiveValue::NotSet) {
            this.status = ActiveValue::Set("open".to_string());
        }
        this.validate()?;
        if !insert && this.updated_at.is_unchanged() {
            this.updated_at = ActiveValue::Set(chrono::Utc::now().into());
        }
        Ok(this)
    }
}

impl Model {
    /// Lists all notes ordered by most recently updated first.
    ///
    /// # Errors
    ///
    /// Returns a `ModelError` when the database query fails.
    pub async fn list_all(db: &DatabaseConnection) -> ModelResult<Vec<Self>> {
        notes::Entity::find()
            .order_by_desc(notes::Column::UpdatedAt)
            .order_by_desc(notes::Column::Id)
            .all(db)
            .await
            .map_err(ModelError::from)
    }

    /// Finds a note by its primary key.
    ///
    /// # Errors
    ///
    /// Returns `ModelError::EntityNotFound` if no such note exists.
    pub async fn find_by_id(db: &DatabaseConnection, id: i64) -> ModelResult<Self> {
        notes::Entity::find_by_id(id)
            .one(db)
            .await?
            .ok_or_else(|| ModelError::EntityNotFound)
    }

    /// Creates a new note with default status `"open"` when omitted.
    ///
    /// # Errors
    ///
    /// Returns `ModelError::Validation` when validation fails or `ModelError::DbErr` on DB error.
    pub async fn create_note(
        db: &DatabaseConnection,
        params: &CreateNoteParams,
    ) -> ModelResult<Self> {
        let status = params
            .status
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .unwrap_or("open")
            .to_string();

        let item = ActiveModel {
            title: ActiveValue::Set(params.title.clone()),
            platform: ActiveValue::Set(params.platform.clone()),
            problem_ref: ActiveValue::Set(params.problem_ref.clone()),
            content: ActiveValue::Set(params.content.clone()),
            tags: ActiveValue::Set(params.tags.clone()),
            status: ActiveValue::Set(status),
            ..Default::default()
        };

        item.validator()
            .validate()
            .map_err(loco_rs::validation::ModelValidationErrors::from)?;
        item.insert(db).await.map_err(ModelError::from)
    }

    /// Updates an existing note by ID.
    ///
    /// # Errors
    ///
    /// Returns `ModelError::EntityNotFound` if missing or `ModelError::Validation` on invalid fields.
    pub async fn update_note(
        db: &DatabaseConnection,
        id: i64,
        params: &UpdateNoteParams,
    ) -> ModelResult<Self> {
        let existing = Self::find_by_id(db, id).await?;
        let mut item = existing.into_active_model();

        if let Some(title) = &params.title {
            item.title = ActiveValue::Set(title.clone());
        }
        if params.platform.is_some() {
            item.platform = ActiveValue::Set(params.platform.clone());
        }
        if params.problem_ref.is_some() {
            item.problem_ref = ActiveValue::Set(params.problem_ref.clone());
        }
        if let Some(content) = &params.content {
            item.content = ActiveValue::Set(content.clone());
        }
        if params.tags.is_some() {
            item.tags = ActiveValue::Set(params.tags.clone());
        }
        if let Some(status) = &params.status {
            item.status = ActiveValue::Set(status.clone());
        }

        item.validator()
            .validate()
            .map_err(loco_rs::validation::ModelValidationErrors::from)?;
        item.update(db).await.map_err(ModelError::from)
    }

    /// Deletes a note by ID.
    ///
    /// # Errors
    ///
    /// Returns `ModelError::EntityNotFound` if no such note exists.
    pub async fn delete_by_id(db: &DatabaseConnection, id: i64) -> ModelResult<()> {
        let existing = Self::find_by_id(db, id).await?;
        existing.delete(db).await?;
        Ok(())
    }
}

impl ActiveModel {}

impl Entity {}
