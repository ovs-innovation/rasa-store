#!/bin/sh
set -eu

echo "[entrypoint] validating runtime environment..."

# PHONEPE_ENABLED=false skips credential requirement (local/dev only)
ENABLED="${PHONEPE_ENABLED:-true}"
case "$(echo "$ENABLED" | tr '[:upper:]' '[:lower:]')" in
  false|0|no|off)
    echo "[entrypoint] PHONEPE_ENABLED=$ENABLED — skipping PhonePe env check"
    ;;
  *)
    MISSING=""
    for KEY in \
      PHONEPE_CLIENT_ID \
      PHONEPE_CLIENT_SECRET \
      PHONEPE_CLIENT_VERSION \
      PHONEPE_ENV \
      PHONEPE_WEBHOOK_USERNAME \
      PHONEPE_WEBHOOK_PASSWORD
    do
      eval "VAL=\${$KEY:-}"
      if [ -z "$VAL" ]; then
        MISSING="${MISSING} ${KEY}"
      fi
    done

    if [ -n "$MISSING" ]; then
      echo "============================================================" >&2
      echo "[FATAL] Missing required PhonePe environment variables:" >&2
      for KEY in $MISSING; do
        echo "  - $KEY" >&2
      done
      echo "" >&2
      echo "Secrets must live on the host in backend/.env and be loaded" >&2
      echo "via docker-compose env_file. Do NOT docker restart — recreate:" >&2
      echo "  docker compose up -d --build --force-recreate backend" >&2
      echo "See docs/DEPLOYMENT_SECRETS.md" >&2
      echo "============================================================" >&2
      exit 1
    fi

    echo "[entrypoint] PhonePe env OK (PHONEPE_ENV=${PHONEPE_ENV})"
    ;;
esac

exec "$@"
