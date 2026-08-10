#!/usr/bin/env bash
# CodeViz — MongoDB backup (A4). Dumps the DB, compresses, keeps the last 14,
# and (optionally) uploads to S3-compatible storage.
#
#   chmod +x deploy/backup.sh
#   crontab -e   ->   0 3 * * *  /opt/codeviz/deploy/backup.sh >> /var/log/codeviz-backup.log 2>&1
#
# Requires: mongodump (mongodb-database-tools). Reads MONGO_URI from the env file.
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/codeviz/backend/.env}"
BACKUP_DIR="${BACKUP_DIR:-/opt/codeviz/backups}"
KEEP="${KEEP:-14}"

# Load MONGO_URI from the env file if present.
if [ -f "$ENV_FILE" ]; then
  export "$(grep -E '^MONGO_URI=' "$ENV_FILE" | head -1)"
fi
: "${MONGO_URI:?MONGO_URI is not set}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/codeviz_$STAMP"

echo "[backup] dumping -> $OUT"
mongodump --uri="$MONGO_URI" --gzip --archive="$OUT.archive.gz"

# Retention: keep the newest $KEEP archives.
ls -1t "$BACKUP_DIR"/codeviz_*.archive.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
echo "[backup] done. keeping newest $KEEP."

# Optional off-box copy (uncomment + configure):
# aws s3 cp "$OUT.archive.gz" "s3://YOUR_BUCKET/codeviz/" --only-show-errors
#
# Restore later with:
#   mongorestore --uri="$MONGO_URI" --gzip --archive=codeviz_STAMP.archive.gz --drop
