#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/lenshub/compose}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-180}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "docker is not installed"
command -v ss >/dev/null 2>&1 || fail "ss is not installed"
[[ -d "$APP_DIR" ]] || fail "Missing directory: $APP_DIR"
[[ -f "$COMPOSE_FILE" ]] || fail "Missing Compose file: $COMPOSE_FILE"
[[ -f "$ENV_FILE" ]] || fail "Missing environment file: $ENV_FILE"
[[ -f "$APP_DIR/backend.prod.env" ]] || fail "Missing backend.prod.env"

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

cd "$APP_DIR"

echo "Validating production Compose..."
compose config --quiet

echo "Starting PostgreSQL and Redis without forced recreation..."
compose up -d lenshub-postgres lenshub-redis

echo "Recreating MinIO with loopback port bindings..."
compose up -d --force-recreate minio

echo "Applying private bucket initialization..."
compose up --no-deps --force-recreate minio-init

echo "Recreating backend with loopback port binding..."
compose up -d --no-deps --force-recreate \
  --wait --wait-timeout "$WAIT_TIMEOUT" backend

echo "Current service status:"
compose ps

echo "Loopback listeners:"
for port in 8080 9000 9001; do
  ss -ltnH | awk '{print $4}' | grep -Fx "127.0.0.1:$port" >/dev/null \
    || fail "127.0.0.1:$port is not listening"
  echo "PASS: 127.0.0.1:$port"
done

echo "Infrastructure restart completed."
