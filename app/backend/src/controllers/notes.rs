#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::http::StatusCode;
use loco_rs::prelude::*;

use crate::{
    models::notes::{self, CreateNoteParams, UpdateNoteParams},
    views::notes::NoteResponse,
};

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let items = notes::Model::list_all(&ctx.db).await?;
    let res: Vec<NoteResponse> = items.iter().map(NoteResponse::from).collect();
    format::json(res)
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    let item = notes::Model::find_by_id(&ctx.db, id).await?;
    format::json(NoteResponse::from(&item))
}

#[debug_handler]
pub async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateNoteParams>,
) -> Result<Response> {
    let item = notes::Model::create_note(&ctx.db, &params).await?;
    format::render()
        .status(StatusCode::CREATED)
        .json(NoteResponse::from(&item))
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i64>,
    State(ctx): State<AppContext>,
    Json(params): Json<UpdateNoteParams>,
) -> Result<Response> {
    let item = notes::Model::update_note(&ctx.db, id, &params).await?;
    format::json(NoteResponse::from(&item))
}

#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    notes::Model::delete_by_id(&ctx.db, id).await?;
    format::empty_json()
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/notes")
        .add("/", get(list))
        .add("/", post(create))
        .add("/{id}", get(get_one))
        .add("/{id}", put(update))
        .add("/{id}", delete(remove))
}
