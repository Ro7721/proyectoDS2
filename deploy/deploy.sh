#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR="/home/azureuser/proyectoDS2"
readonly ENV_FILE="/home/azureuser/proyecto-roger-azure/.env"
readonly COMPOSE_FILE="${APP_DIR}/deploy/docker-compose.deploy.yml"
readonly APP_URL="https://edulearn-roger.eastus.cloudapp.azure.com"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "No existe el repositorio Git en ${APP_DIR}."
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "No existe el archivo seguro de variables: ${ENV_FILE}."
  exit 1
fi

sudo -n true

cd "${APP_DIR}"
git fetch origin master:refs/remotes/origin/master

if git show-ref --verify --quiet refs/heads/master; then
  git checkout master
  git merge --ff-only origin/master
else
  git checkout --track -b master origin/master
fi

sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build --pull backend frontend
sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --no-deps backend frontend caddy
sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps

if command -v curl >/dev/null 2>&1; then
  curl --fail --silent --show-error --retry 12 --retry-delay 5 "${APP_URL}/" >/dev/null
  echo "Despliegue verificado en ${APP_URL}"
fi

sudo docker image prune -f
