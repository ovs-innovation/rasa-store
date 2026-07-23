#!/usr/bin/env bash
# Fail if backend/.env (or BACKEND_ENV_FILE) is missing required PhonePe keys.
# Safe to run in Jenkins before docker compose.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BACKEND_ENV_FILE:-$ROOT_DIR/backend/.env}"

REQUIRED_KEYS=(
  PHONEPE_CLIENT_ID
  PHONEPE_CLIENT_SECRET
  PHONEPE_CLIENT_VERSION
  PHONEPE_ENV
  PHONEPE_WEBHOOK_USERNAME
  PHONEPE_WEBHOOK_PASSWORD
)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FATAL: missing env file: $ENV_FILE" >&2
  exit 1
fi

MISSING=()
for KEY in "${REQUIRED_KEYS[@]}"; do
  if ! grep -E "^[[:space:]]*${KEY}=([^[:space:]#].*)$" "$ENV_FILE" >/dev/null 2>&1; then
    MISSING+=("$KEY")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "FATAL: missing required variables in $ENV_FILE:" >&2
  printf '  - %s\n' "${MISSING[@]}" >&2
  exit 1
fi

echo "OK: all required PhonePe variables present in $ENV_FILE"
