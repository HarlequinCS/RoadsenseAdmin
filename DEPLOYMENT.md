# RoadSense Admin — VPS Deployment Guide

## Architecture

```
Internet → Cloudflare → Nginx (443) → 127.0.0.1:3010 → Docker (roadsense-admin)
```

| Component | Value |
|-----------|-------|
| Project path | `/home/dengkis/projects/roadsense-admin` |
| Container name | `roadsense-admin` |
| Host port | `127.0.0.1:3010` (not exposed publicly) |
| Domain | `https://roadsense.saifuliqbal.dev` |
| Nginx config | `/etc/nginx/sites-available/roadsense-admin` |
| SSL cert | `/etc/letsencrypt/live/roadsense.saifuliqbal.dev/` (existing) |

## Prerequisites

1. **GitHub SSH access** — add this server's public key to the `HarlequinCS/RoadsenseAdmin` repo:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. **Environment file** — created automatically from `.env.example` during deploy:
   ```bash
   cp .env.example .env && chmod 600 .env
   ```
   Update `.env` with production values when ready.

## Deploy

```bash
# Full deployment (clone + build + nginx)
bash /home/dengkis/projects/roadsense-admin/scripts/deploy.sh

# Or skip nginx if sudo isn't available in this session:
bash /home/dengkis/projects/roadsense-admin/scripts/deploy.sh --skip-nginx
sudo bash /home/dengkis/projects/roadsense-admin/scripts/apply-nginx.sh
```

## Update / Redeploy

```bash
cd /home/dengkis/projects/roadsense-admin
git pull
docker compose build --no-cache
docker compose up -d
docker logs roadsense-admin --tail 50
```

## Rollback

```bash
cd /home/dengkis/projects/roadsense-admin
git checkout <previous-commit>
docker compose build && docker compose up -d
```

## Backup Recommendations

- `.env` — store encrypted copy off-server (1Password, etc.)
- `docker-compose.yml`, `Dockerfile`, nginx config — in git
- Database backups — if app uses a DB, back up separately
- Before major updates: `docker commit roadsense-admin roadsense-admin:backup-$(date +%Y%m%d)`

## Firebase setup

### Web app ID (required for auth)

1. Open [Firebase Console](https://console.firebase.google.com) → project `roadsense-2bbad`
2. **Project settings → Your apps → Add app → Web**
3. Copy the `appId` into `.env` as `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Rebuild: `docker compose build && docker compose up -d`

### Authorized domains

Add `roadsense.saifuliqbal.dev` under **Authentication → Settings → Authorized domains**.

### Firestore security rules (required)

Deploy the rules in `firestore.rules` to Firebase Console → **Firestore → Rules** (or via Firebase CLI):

```bash
firebase deploy --only firestore:rules
```

The rules enforce:
- `hazards` — signed-in read/create; admin update/delete; limited community verification fields for mobile users
- `users` — admin only
- `audit_log` — admin read/create only; append-only (no update/delete)

**Important:** Until these rules are deployed, client-side admin checks alone do not protect your database.

### Admin session cookies

After login, the app sets an httpOnly `roadsense_admin_session` cookie. Next.js middleware uses it to block unauthenticated access to `/dashboard`, `/reports`, etc. Sign out clears the cookie via `DELETE /api/auth/session`.

### Docker secrets

- `.env` is **not** copied into the Docker image.
- Only `NEXT_PUBLIC_*` variables are passed as build args (see `docker-compose.yml`).
- Server secrets (`GROQ_API_KEYS`, etc.) are loaded at runtime via `env_file: .env`.
- Rebuild after changing `NEXT_PUBLIC_*` values.

### Security checklist after deploy

1. Rotate Groq API keys if they were ever exposed.
2. Restrict Firebase and Maps API keys by HTTP referrer in Google Cloud Console.
3. Deploy `firestore.rules` to production.
4. Never set `NEXT_PUBLIC_SKIP_ADMIN_CHECK`, `NEXT_PUBLIC_ENABLE_SEED`, or `AI_SKIP_ADMIN_VERIFY` in production.
5. Apply updated nginx config from `deploy/nginx-roadsense-admin.conf` (CSP + HSTS).

### Admin custom claim

Grant `{ admin: true }` via `scripts/set-admin-claim.mjs` (run locally with a service account JSON — do not leave the key on the VPS).
