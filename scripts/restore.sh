#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Uso: $0 <arquivo-de-backup.sql.gz>"
  exit 1
fi

BACKUP_FILE=$1
DB_CONTAINER=${DB_CONTAINER:-"projagendamentos-db-1"}
DB_USER=${DB_USER:-"agendamento"}
DB_NAME=${DB_NAME:-"agendamento"}

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Arquivo não encontrado: $BACKUP_FILE"
  exit 1
fi

echo "Restaurando backup de $BACKUP_FILE..."

if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME"
else
  cat "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME"
fi

echo "Restauração concluída com sucesso!"
