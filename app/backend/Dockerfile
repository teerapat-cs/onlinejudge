# syntax=docker/dockerfile:1
#
# Production image for the Loco.rs API.
# Railway builds this file with the service root directory set to `app/backend`
# (see `railway.json` and `../DEPLOY_RAILWAY.md`).

############################
# 1. Build stage
############################
FROM rust:1.99-slim-bookworm AS builder

# `ring` (rustls) and `libsqlite3-sys` compile C sources, so a C toolchain is
# required even though the app itself does not link OpenSSL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- dependency cache -------------------------------------------------------
# Compile every dependency once against stub sources so a later source-only
# change does not rebuild the whole Loco/SeaORM tree. The stubs are deleted
# right after, and the real sources are copied in the next layer.
COPY Cargo.toml Cargo.lock ./
COPY migration/Cargo.toml ./migration/Cargo.toml
RUN mkdir -p src/bin migration/src \
    && printf 'pub fn placeholder() {}\n' > src/lib.rs \
    && printf 'fn main() {}\n' > src/bin/main.rs \
    && printf 'fn main() {}\n' > src/bin/tool.rs \
    && printf '' > migration/src/lib.rs \
    && cargo build --release --locked --bin backend-cli \
    && rm -rf src migration/src
# ---------------------------------------------------------------------------

# `config/` holds the Tera-templated environment files, read at boot.
COPY config ./config
COPY migration/src ./migration/src
# `src/` also carries `src/fixtures/`, which `backend-cli db seed` needs.
COPY src ./src

# Docker keeps the mtimes of copied files, and they are usually *older* than the
# artifacts produced by the stub build above. Cargo decides freshness by mtime,
# so without bumping them it would consider the workspace crates unchanged and
# ship the stub `backend-cli` (which does nothing). Touching the sources forces
# a real rebuild; dependencies above stay cached.
RUN find src migration/src -name '*.rs' -exec touch {} + \
    && cargo build --release --locked --bin backend-cli

# Guard against the cache trick above silently regressing: the real Loco binary
# is tens of MB, the stub one only a few hundred KB.
RUN test "$(stat -c %s target/release/backend-cli)" -gt 1000000

############################
# 2. Runtime stage
############################
FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 --shell /usr/sbin/nologin loco

WORKDIR /app

COPY --from=builder /app/target/release/backend-cli /usr/local/bin/backend-cli
COPY --from=builder /app/config ./config
COPY --from=builder /app/src/fixtures ./src/fixtures

# LOCO_ENV selects `config/production.yaml` (default would be `development`,
# i.e. the local SQLite config). BINDING/PORT make the server reachable from
# outside the container; Railway can override PORT through service variables.
ENV LOCO_ENV=production \
    BINDING=0.0.0.0 \
    PORT=5150

USER loco

EXPOSE 5150

CMD ["backend-cli", "start"]
