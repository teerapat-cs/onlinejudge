use sea_orm::prelude::{DateTimeWithTimeZone, Json};
use serde::{Deserialize, Serialize};

use crate::models::_entities::algorithms;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AlgorithmResponse {
    pub id: i64,
    pub slug: String,
    pub name: String,
    pub category: String,
    pub description: Option<String>,
    pub pseudocode: Option<String>,
    pub time_complexity: Option<String>,
    pub space_complexity: Option<String>,
    pub sample_input: Option<Json>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

impl From<&algorithms::Model> for AlgorithmResponse {
    fn from(algo: &algorithms::Model) -> Self {
        Self {
            id: algo.id,
            slug: algo.slug.clone(),
            name: algo.name.clone(),
            category: algo.category.clone(),
            description: algo.description.clone(),
            pseudocode: algo.pseudocode.clone(),
            time_complexity: algo.time_complexity.clone(),
            space_complexity: algo.space_complexity.clone(),
            sample_input: algo.sample_input.clone(),
            created_at: algo.created_at,
            updated_at: algo.updated_at,
        }
    }
}

impl From<algorithms::Model> for AlgorithmResponse {
    fn from(algo: algorithms::Model) -> Self {
        Self::from(&algo)
    }
}

