#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

node -e 'if (Number(process.versions.node.split(".")[0]) !== 22) { console.error("Select Node 22 for this cloud environment."); process.exit(1); }'
npm ci
npx playwright install --with-deps chromium
