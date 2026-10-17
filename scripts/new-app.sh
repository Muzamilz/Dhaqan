#!/usr/bin/env bash
set -euo pipefail

# Scaffolds a new web app from this starter-web template.
#
# Usage:
#   scripts/new-app.sh <target-dir> [app-name]
#
# Copies this repo into <target-dir>, resets git history, renames the package,
# creates a fresh .env from .env.example, installs dependencies, and regenerates
# the Prisma client. It does NOT run migrations — do that after setting your
# database password in the new project's .env.

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-}"
APP_NAME="${2:-}"

if [[ -z "$TARGET_DIR" ]]; then
  echo "Usage: scripts/new-app.sh <target-dir> [app-name]" >&2
  exit 1
fi

if [[ -z "$APP_NAME" ]]; then
  APP_NAME="$(basename "$TARGET_DIR")"
fi

APP_NAME="$(printf '%s' "$APP_NAME" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9._-' '-')"

SOURCE_RESOLVED="$(realpath "$SOURCE_DIR")"
TARGET_RESOLVED="$(realpath -m "$TARGET_DIR")"

if [[ "$TARGET_RESOLVED" == "$SOURCE_RESOLVED"* ]]; then
  echo "error: target-dir cannot be inside the template itself" >&2
  exit 1
fi

if [[ -e "$TARGET_DIR" ]] && [[ -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]]; then
  echo "error: target-dir must be empty or not exist: $TARGET_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

command -v rsync >/dev/null 2>&1 || { echo "error: rsync is required" >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "error: git is required" >&2; exit 1; }

echo "Copying template to $TARGET_DIR ..."
rsync -a \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.env' \
  --exclude 'app/generated/prisma/' \
  "$SOURCE_DIR/" "$TARGET_DIR/"

cd "$TARGET_DIR"

echo "Renaming package to '$APP_NAME' ..."
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.name = process.argv[1];
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
" "$APP_NAME"

cp .env.example .env
echo "Created .env — set DATABASE_URL to your PostgreSQL credentials."

git init -b main >/dev/null

echo "Installing dependencies ..."
npm install

echo "Generating Prisma client ..."
npx prisma generate

echo
echo "Done. Next steps:"
echo "  1. cd $TARGET_DIR"
echo "  2. Edit .env and set your PostgreSQL password (user currently 'dev', db 'app_dev')."
echo "  3. npx prisma migrate dev --name init   # create tables in your database"
echo "  4. npm run dev                          # open http://localhost:3000"