use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};

use crate::models::_entities::notes;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct NoteResponse {
    pub id: i64,
    pub title: String,
    pub platform: Option<String>,
    pub problem_ref: Option<String>,
    pub content: String,
    pub tags: Option<String>,
    pub status: String,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

impl From<&notes::Model> for NoteResponse {
    fn from(note: &notes::Model) -> Self {
        Self {
            id: note.id,
            title: note.title.clone(),
            platform: note.platform.clone(),
            problem_ref: note.problem_ref.clone(),
            content: note.content.clone(),
            tags: note.tags.clone(),
            status: note.status.clone(),
            created_at: note.created_at,
            updated_at: note.updated_at,
        }
    }
}

impl From<notes::Model> for NoteResponse {
    fn from(note: notes::Model) -> Self {
        Self::from(&note)
    }
}

