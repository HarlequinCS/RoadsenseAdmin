#!/usr/bin/env bash
# Apply nginx config for roadsense-admin (sudo required)
set -euo pipefail

PROJECT_DIR="/home/dengkis/projects/roadsense-admin"
NGINX_SOURCE="${PROJECT_DIR}/deploy/nginx-roadsense-admin.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/roadsense-admin"
NGINX_ENABLED="/etc/nginx/sites-enabled/roadsense-admin"

[[ -f "${NGINX_SOURCE}" ]] || { echo "Missing ${NGINX_SOURCE}"; exit 1; }

echo "Installing nginx config..."
cp "${NGINX_SOURCE}" "${NGINX_AVAILABLE}"
ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"

if [[ -L /etc/nginx/sites-enabled/roadsense ]]; then
    echo "Disabling placeholder roadsense site (preserving sites-available/roadsense)"
    rm /etc/nginx/sites-enabled/roadsense
fi

if ! grep -q 'map \$http_upgrade \$connection_upgrade' /etc/nginx/nginx.conf; then
    echo "Adding WebSocket upgrade map to nginx.conf"
    sed -i '/http {/a\\n    map $http_upgrade $connection_upgrade {\n        default upgrade;\n        '"'"''"'"'      close;\n    }' /etc/nginx/nginx.conf
fi

nginx -t
systemctl reload nginx
echo "Nginx applied and reloaded."
