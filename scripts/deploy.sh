#!/usr/bin/env bash
# RoadSense Admin — production deployment orchestrator
# Run as: dengkis (Docker) + sudo for nginx steps
set -euo pipefail

PROJECT_DIR="/home/dengkis/projects/roadsense-admin"
REPO_URL="https://github.com/HarlequinCS/RoadsenseAdmin.git"
CONTAINER_PORT=3010
APP_PORT=3000
CONTAINER_NAME="roadsense-admin"
NGINX_AVAILABLE="/etc/nginx/sites-available/roadsense-admin"
NGINX_ENABLED="/etc/nginx/sites-enabled/roadsense-admin"
NGINX_SOURCE="${PROJECT_DIR}/deploy/nginx-roadsense-admin.conf"

log() { echo "[$(date '+%H:%M:%S')] $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

# ── Step 2: Clone repository ────────────────────────────────────────────────
clone_repo() {
    log "Step 2 — Preparing project directory"
    mkdir -p "${PROJECT_DIR}"

    if [[ -f "${PROJECT_DIR}/package.json" ]]; then
        log "Repository already present — pulling latest"
        git -C "${PROJECT_DIR}" pull --ff-only
        return
    fi

    log "Cloning ${REPO_URL}"
    local tmpdir
    tmpdir="$(mktemp -d)"
    git clone "${REPO_URL}" "${tmpdir}"

    # Preserve local deployment scaffolding if the repo doesn't include it
    local backup=""
    if [[ -d "${PROJECT_DIR}/deploy" || -d "${PROJECT_DIR}/scripts" ]]; then
        backup="$(mktemp -d)"
        cp -a "${PROJECT_DIR}/deploy" "${PROJECT_DIR}/scripts" \
              "${PROJECT_DIR}/DEPLOYMENT.md" "${PROJECT_DIR}/.gitignore" \
              "${backup}/" 2>/dev/null || true
    fi

    cp -a "${tmpdir}/." "${PROJECT_DIR}/"
    rm -rf "${tmpdir}"

    if [[ -n "${backup}" ]]; then
        cp -an "${backup}/deploy/." "${PROJECT_DIR}/deploy/" 2>/dev/null || true
        cp -an "${backup}/scripts/." "${PROJECT_DIR}/scripts/" 2>/dev/null || true
        cp -an "${backup}/DEPLOYMENT.md" "${PROJECT_DIR}/" 2>/dev/null || true
        cp -an "${backup}/.gitignore" "${PROJECT_DIR}/" 2>/dev/null || true
        rm -rf "${backup}"
    fi
}

# ── Step 3: Analyze project ───────────────────────────────────────────────
detect_framework() {
    log "Step 3 — Analyzing project"
    [[ -f "${PROJECT_DIR}/package.json" ]] || die "package.json not found after clone"

    python3 - <<'PY'
import json, pathlib, sys

pkg_path = pathlib.Path("/home/dengkis/projects/roadsense-admin/package.json")
pkg = json.loads(pkg_path.read_text())

deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
scripts = pkg.get("scripts", {})

framework = "unknown"
if "next" in deps:
    framework = "nextjs"
elif "vite" in deps:
    framework = "vite"
elif "react-scripts" in deps:
    framework = "cra"
elif "@remix-run/react" in deps or "remix" in deps:
    framework = "remix"
elif "nuxt" in deps:
    framework = "nuxt"

build_cmd = scripts.get("build", "")
start_cmd = scripts.get("start", scripts.get("preview", ""))

print(f"FRAMEWORK={framework}")
print(f"BUILD_CMD={build_cmd}")
print(f"START_CMD={start_cmd}")
print(f"NODE_VERSION={pkg.get('engines', {}).get('node', '20')}")

# Detect env files referenced in repo
root = pkg_path.parent
env_candidates = [".env.example", ".env.sample", ".env.template", "env.example"]
for name in env_candidates:
    p = root / name
    if p.exists():
        print(f"ENV_TEMPLATE={p}")
PY
}

# ── Step 5: Generate Docker files if missing ──────────────────────────────
generate_docker_files() {
    log "Step 5 — Generating Docker configuration"
    local framework="${1:-unknown}"

    if [[ -f "${PROJECT_DIR}/Dockerfile" && -f "${PROJECT_DIR}/docker-compose.yml" ]]; then
        log "Dockerfile and docker-compose.yml already exist — skipping generation"
        return
    fi

    case "${framework}" in
        nextjs)
            cat > "${PROJECT_DIR}/Dockerfile" <<'DOCKERFILE'
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    else npm ci; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
DOCKERFILE
            # Enable standalone output if next.config exists
            if [[ -f "${PROJECT_DIR}/next.config.mjs" || -f "${PROJECT_DIR}/next.config.js" || -f "${PROJECT_DIR}/next.config.ts" ]]; then
                log "NOTE: Ensure next.config has 'output: standalone' for Docker deployment"
            fi
            APP_PORT=3000
            ;;
        vite|cra)
            cat > "${PROJECT_DIR}/Dockerfile" <<'DOCKERFILE'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    else npm ci; fi
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE
            mkdir -p "${PROJECT_DIR}/deploy"
            cat > "${PROJECT_DIR}/deploy/nginx-spa.conf" <<'NGINX'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
            APP_PORT=80
            ;;
        *)
            cat > "${PROJECT_DIR}/Dockerfile" <<'DOCKERFILE'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    else npm ci; fi
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next 2>/dev/null || true
COPY --from=builder /app/dist ./dist 2>/dev/null || true
COPY --from=builder /app/build ./build 2>/dev/null || true
COPY --from=builder /app/public ./public 2>/dev/null || true
EXPOSE 3000
CMD ["npm", "run", "start"]
DOCKERFILE
            APP_PORT=3000
            ;;
    esac

    cat > "${PROJECT_DIR}/docker-compose.yml" <<COMPOSE
services:
  ${CONTAINER_NAME}:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${CONTAINER_NAME}
    restart: unless-stopped
    ports:
      - "127.0.0.1:${CONTAINER_PORT}:${APP_PORT}"
    env_file:
      - .env
    networks:
      - roadsense-admin-net
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:${APP_PORT}/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  roadsense-admin-net:
    name: roadsense-admin-net
    driver: bridge
COMPOSE

    log "Generated Dockerfile and docker-compose.yml (framework: ${framework}, app port: ${APP_PORT})"
}

# ── Step 4: Environment file check ────────────────────────────────────────
check_env() {
    log "Step 4 — Checking environment configuration"

    if [[ -f "${PROJECT_DIR}/.env" ]]; then
        chmod 600 "${PROJECT_DIR}/.env"
        log ".env found — permissions set to 600"
        return
    fi

    if [[ -f "${PROJECT_DIR}/.env.example" ]]; then
        cp "${PROJECT_DIR}/.env.example" "${PROJECT_DIR}/.env"
        chmod 600 "${PROJECT_DIR}/.env"
        log "Created .env from .env.example (permissions: 600)"
        return
    fi

    if [[ -f "${PROJECT_DIR}/.env.production.example" ]]; then
        cp "${PROJECT_DIR}/.env.production.example" "${PROJECT_DIR}/.env"
        chmod 600 "${PROJECT_DIR}/.env"
        log "Created .env from .env.production.example (permissions: 600)"
        return
    fi

    die "No .env or .env.example found — cannot configure environment"
}

# ── Step 5: Build and run container ───────────────────────────────────────
deploy_container() {
    log "Step 5 — Building and starting Docker container"
    cd "${PROJECT_DIR}"
    docker compose down 2>/dev/null || true
    docker compose build --no-cache
    docker compose up -d
    log "Waiting for container health..."
    sleep 5
    docker ps --filter "name=${CONTAINER_NAME}"
    docker logs "${CONTAINER_NAME}" --tail 30 2>&1 || true
}

# ── Step 6: Nginx configuration ───────────────────────────────────────────
apply_nginx() {
    log "Step 6 — Applying nginx configuration (requires sudo)"
    [[ -f "${NGINX_SOURCE}" ]] || die "Nginx config not found at ${NGINX_SOURCE}"

    sudo cp "${NGINX_SOURCE}" "${NGINX_AVAILABLE}"
    sudo ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"

    # Disable placeholder config (keep file, remove symlink only)
    if [[ -L /etc/nginx/sites-enabled/roadsense ]]; then
        log "Disabling placeholder roadsense site (file preserved in sites-available)"
        sudo rm /etc/nginx/sites-enabled/roadsense
    fi

    # WebSocket map (add once to nginx.conf if missing)
    if ! grep -q 'map \$http_upgrade \$connection_upgrade' /etc/nginx/nginx.conf 2>/dev/null; then
        log "Adding WebSocket upgrade map to nginx.conf"
        sudo sed -i '/http {/a\\n    map $http_upgrade $connection_upgrade {\n        default upgrade;\n        '"'"''"'"'      close;\n    }' /etc/nginx/nginx.conf
    fi

    sudo nginx -t
    sudo systemctl reload nginx
    log "Nginx reloaded successfully"
}

# ── Step 7 & 8: Verification ──────────────────────────────────────────────
verify_deployment() {
    log "Step 7/8 — Verifying deployment"

    echo ""
    echo "=== Docker ==="
    docker ps --filter "name=${CONTAINER_NAME}"
    echo ""
    echo "=== Container logs (last 20 lines) ==="
    docker logs "${CONTAINER_NAME}" --tail 20 2>&1
    echo ""
    echo "=== Nginx status ==="
    systemctl status nginx --no-pager -l 2>&1 | head -15 || sudo systemctl status nginx --no-pager -l 2>&1 | head -15
    echo ""
    echo "=== HTTPS check ==="
    curl -sI "https://roadsense.saifuliqbal.dev" | head -10
    echo ""
    echo "=== Local upstream check ==="
    curl -sI "http://127.0.0.1:${CONTAINER_PORT}" | head -10
}

# ── Main ──────────────────────────────────────────────────────────────────
main() {
    local skip_nginx=false
    for arg in "$@"; do
        [[ "$arg" == "--skip-nginx" ]] && skip_nginx=true
    done

    clone_repo

    eval "$(detect_framework)"
    log "Detected framework: ${FRAMEWORK}"
    log "Build command: ${BUILD_CMD}"
    log "Start command: ${START_CMD}"

    generate_docker_files "${FRAMEWORK}"
    check_env
    deploy_container

    if [[ "${skip_nginx}" == "false" ]]; then
        apply_nginx
    else
        log "Skipping nginx (--skip-nginx). Run: sudo bash ${PROJECT_DIR}/scripts/apply-nginx.sh"
    fi

    verify_deployment
    log "Deployment complete."
}

main "$@"
