#!/usr/bin/env bash
# Deploy / recreate rasa_backend with host env_file injected.
# Usage (on VPS, from repo root):
#   chmod +x scripts/deploy-backend.sh
#   ./scripts/deploy-backend.sh
#
# NEVER use `docker restart rasa_backend` after editing backend/.env —
# restart does not reload env_file. This script always force-recreates.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${BACKEND_ENV_FILE:-$ROOT_DIR/backend/.env}"
COMPOSE="${COMPOSE_CMD:-docker compose}"

REQUIRED_KEYS=(
  PHONEPE_CLIENT_ID
  PHONEPE_CLIENT_SECRET
  PHONEPE_CLIENT_VERSION
  PHONEPE_ENV
  PHONEPE_WEBHOOK_USERNAME
  PHONEPE_WEBHOOK_PASSWORD
)

echo "==> Deploy backend from: $ROOT_DIR"
echo "==> Env file: $ENV_FILE"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FATAL: missing $ENV_FILE" >&2
  echo "Copy backend/.env.example → backend/.env and fill PhonePe secrets." >&2
  exit 1
fi

MISSING=()
for KEY in "${REQUIRED_KEYS[@]}"; do
  # Match KEY=non-empty (ignore comments / blank)
  if ! grep -E "^[[:space:]]*${KEY}=([^[:space:]#].*)$" "$ENV_FILE" >/dev/null 2>&1; then
    MISSING+=("$KEY")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "FATAL: backend/.env is missing required PhonePe variables:" >&2
  for KEY in "${MISSING[@]}"; do
    echo "  - $KEY" >&2
  done
  echo "Deployment aborted. See docs/DEPLOYMENT_SECRETS.md" >&2
  exit 1
fi

echo "==> Host env file contains all required PHONEPE_* keys"

echo "==> Building and force-recreating rasa_backend (env_file reload)"
$COMPOSE up -d --build --force-recreate --no-deps backend

echo "==> Waiting for container to become healthy..."
ATTEMPTS=36
for ((i=1; i<=ATTEMPTS; i++)); do
  STATUS="$($COMPOSE ps --format json backend 2>/dev/null | head -n1 || true)"
  HEALTH="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' rasa_backend 2>/dev/null || echo missing)"
  RUNNING="$(docker inspect -f '{{.State.Running}}' rasa_backend 2>/dev/null || echo false)"

  if [[ "$HEALTH" == "healthy" ]]; then
    echo "==> Container healthy"
    break
  fi

  if [[ "$RUNNING" != "true" ]]; then
    echo "Container not running (attempt $i/$ATTEMPTS). Recent logs:" >&2
    docker logs --tail 40 rasa_backend >&2 || true
    if [[ $i -eq $ATTEMPTS ]]; then
      exit 1
    fi
  fi

  if [[ $i -eq $ATTEMPTS ]]; then
    echo "FATAL: timed out waiting for healthy backend (status=$HEALTH)" >&2
    docker logs --tail 80 rasa_backend >&2 || true
    exit 1
  fi
  sleep 5
done

echo "==> Verifying PHONEPE_* inside container"
PHONEPE_ENV_OUT="$(docker exec rasa_backend printenv | grep '^PHONEPE_' || true)"
if [[ -z "$PHONEPE_ENV_OUT" ]]; then
  echo "FATAL: no PHONEPE_* variables inside rasa_backend" >&2
  echo "env_file was not injected. Check compose file + backend/.env path." >&2
  exit 1
fi
echo "$PHONEPE_ENV_OUT"

for KEY in "${REQUIRED_KEYS[@]}"; do
  if ! echo "$PHONEPE_ENV_OUT" | grep -q "^${KEY}="; then
    echo "FATAL: container missing $KEY" >&2
    exit 1
  fi
done

echo "==> Probing /api/system/config"
CONFIG_JSON="$(docker exec rasa_backend wget -qO- http://127.0.0.1:5000/api/system/config 2>/dev/null \
  || docker exec rasa_backend node -e "fetch('http://127.0.0.1:5000/api/system/config').then(r=>r.text()).then(console.log)" )"
echo "$CONFIG_JSON"

if ! echo "$CONFIG_JSON" | grep -q '"phonepeConfigured":true'; then
  echo "FATAL: phonepeConfigured is not true" >&2
  exit 1
fi

echo "✅ Backend deploy OK — PhonePe env injected and validated."
