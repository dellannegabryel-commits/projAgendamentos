#!/bin/bash
set -e

BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER=${DB_CONTAINER:-"projagendamentos-db-1"}
DB_USER=${DB_USER:-"agendamento"}
DB_NAME=${DB_NAME:-"agendamento"}

mkdir -p "$BACKUP_DIR"

echo "Iniciando backup do banco $DB_NAME..."
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "Compactando backup..."
gzip "$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "Backup concluído: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
