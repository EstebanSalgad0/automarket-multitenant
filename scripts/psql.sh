#!/usr/bin/env bash
# Conectar a la base del docker-compose
export PGPASSWORD="${POSTGRES_PASSWORD:-saas_pass}"
psql -h 127.0.0.1 -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-saas_user}" -d "${POSTGRES_DB:-saas}" "$@"
