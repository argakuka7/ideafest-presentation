#!/bin/bash
# Deploy mockup IDEATALKS ke Netlify.
# Pakai: ./deploy-netlify.sh <NETLIFY_AUTH_TOKEN> [site-id]
# Token dibuat di: Netlify -> Account settings -> API tokens -> Personal access tokens
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN="${1:?usage: deploy-netlify.sh <NETLIFY_AUTH_TOKEN> [site-id]}"
SITE_ID="${2:-}"

export NETLIFY_AUTH_TOKEN="$TOKEN"

cd "$DIR"

if [ -n "$SITE_ID" ]; then
    npx --yes netlify-cli deploy --dir=. --prod --site "$SITE_ID"
else
    npx --yes netlify-cli deploy --dir=. --prod
fi

echo
echo "Selesai. Cek URL di: https://app.netlify.com/sites"
