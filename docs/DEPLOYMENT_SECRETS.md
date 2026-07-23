# Production secrets & PhonePe deployment

## Root cause of empty `PHONEPE_*` in `rasa_backend`

Docker Compose loads `backend/.env` into the container **only when the container is created**.

| Action | Reloads `env_file`? |
|--------|---------------------|
| `docker compose up -d --force-recreate backend` | **Yes** |
| `./scripts/deploy-backend.sh` | **Yes** |
| `docker restart rasa_backend` | **No** |
| `docker start rasa_backend` | **No** |
| Editing env inside a running container | Lost on recreate; **do not do this** |

If `backend/.env` on the VPS was missing PhonePe keys, or the container was only restarted after keys were added, `printenv | grep PHONEPE` stays empty.

---

## Where production secrets live

**Canonical location (required):**

```text
<repo-on-vps>/backend/.env
```

Example:

```text
/var/www/rasa-store/backend/.env
# or wherever docker-compose.yml lives:
/home/ubuntu/farmcy_kart/backend/.env
```

- Owned by the deploy user, mode `600`
- **Never committed to git** (listed in `backend/.gitignore`)
- **Never baked into the Docker image** (listed in `backend/.dockerignore`)
- Compose injects it via:

```yaml
# docker-compose.yml → backend
env_file:
  - ./backend/.env
```

### Required PhonePe keys

```env
PHONEPE_ENV=production
PHONEPE_CLIENT_ID=...
PHONEPE_CLIENT_VERSION=1
PHONEPE_CLIENT_SECRET=...
PHONEPE_WEBHOOK_USERNAME=...
PHONEPE_WEBHOOK_PASSWORD=...
PHONEPE_ENABLED=true
```

Optional but recommended: `PHONEPE_MERCHANT_ID`.

Webhook URL in PhonePe dashboard:

```text
https://<api-host>/api/webhooks/phonepe
```

Use the same username/password as `PHONEPE_WEBHOOK_*` (SHA256 auth).

---

## Deploy (permanent procedure)

From the repo root on the VPS:

```bash
# 1) Ensure secrets exist on the host
nano backend/.env   # or sync from your secret store

# 2) Validate before touching Docker
chmod +x scripts/validate-backend-env.sh scripts/deploy-backend.sh
./scripts/validate-backend-env.sh

# 3) Recreate backend so env_file is injected
./scripts/deploy-backend.sh
```

Jenkins: use the root `Jenkinsfile`. It validates env, force-recreates, then asserts `PHONEPE_*` inside the container.

---

## Automatic guards

1. **`backend/docker-entrypoint.sh`** — exits `1` if any required `PHONEPE_*` var is missing.
2. **`backend/config/validateEnv.js`** — Node fails closed before Express listens.
3. **`GET /api/system/config`** — returns `{ phonepeConfigured, resendConfigured, smtpConfigured }` (no secrets).
4. **Compose healthcheck** — probes `/api/system/config`.
5. **Deploy script** — refuses to deploy if host `backend/.env` is incomplete; verifies `docker exec … printenv`.

---

## Verification checklist

```bash
docker exec rasa_backend printenv | grep PHONEPE
# must list all PHONEPE_* keys

curl -s http://127.0.0.1:3051/api/system/config
# {"phonepeConfigured":true,"resendConfigured":...,"smtpConfigured":...}

docker logs rasa_backend 2>&1 | tail -50
# must NOT contain "PhonePe credentials missing"
```

---

## Local development

Local `backend/.env` is loaded by `dotenv` (`config/env.js`).  
To run without PhonePe:

```env
PHONEPE_ENABLED=false
```

Production must keep `PHONEPE_ENABLED=true` (or unset) with all credentials present.
