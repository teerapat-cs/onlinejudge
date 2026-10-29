#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;

use crate::{models::algorithms, views::algorithms::AlgorithmResponse};

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let items = algorithms::Model::list_all(&ctx.db).await?;
    let res: Vec<AlgorithmResponse> = items.iter().map(AlgorithmResponse::from).collect();
    format::json(res)
}

#[debug_handler]
pub async fn get_by_slug(
    Path(slug): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let item = algorithms::Model::find_by_slug(&ctx.db, &slug).await?;
    format::json(AlgorithmResponse::from(&item))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/algorithms")
        .add("/", get(list))
        .add("/{slug}", get(get_by_slug))
}
