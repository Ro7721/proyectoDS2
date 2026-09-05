#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR="/home/azureuser/proyectoDS2"
readonly ENV_FILE="/home/azureuser/proyecto-roger-azure/.env"
readonly COMPOSE_FILE="${APP_DIR}/deploy/docker-compose.deploy.yml"
readonly APP_URL="https://edulearn-roger.eastus.cloudapp.azure.com"
readonly DB_CONTAINER="roger-db"

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
  git checkout --no-track -b master refs/remotes/origin/master
fi

sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" config --quiet

if ! sudo docker inspect "${DB_CONTAINER}" >/dev/null 2>&1; then
  echo "No existe el contenedor de base de datos ${DB_CONTAINER}."
  exit 1
fi

db_state="$(sudo docker inspect --format '{{.State.Status}}' "${DB_CONTAINER}")"
if [[ "${db_state}" != "running" ]]; then
  echo "MySQL no está ejecutándose (estado: ${db_state}). Se cancela antes de compilar."
  exit 1
fi

echo "Esperando que MySQL esté saludable..."
db_healthy=false
for _ in $(seq 1 60); do
  db_health="$(sudo docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "${DB_CONTAINER}")"
  if [[ "${db_health}" == "healthy" ]]; then
    db_healthy=true
    break
  fi
  sleep 2
done

if [[ "${db_healthy}" != "true" ]]; then
  echo "MySQL no alcanzó el estado healthy. Se cancela sin reemplazar la aplicación."
  sudo docker inspect --format '{{range .State.Health.Log}}{{println .End "exit=" .ExitCode .Output}}{{end}}' "${DB_CONTAINER}" | tail -20
  exit 1
fi

echo "Memoria disponible antes de compilar:"
free -h

# La VM tiene recursos limitados. Construir uno por vez evita otra saturación.
export COMPOSE_PARALLEL_LIMIT=1
sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build --pull backend
sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build --pull frontend

sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --no-deps backend caddy

echo "Esperando que el backend responda..."
backend_ready=false
for _ in $(seq 1 36); do
  status_code="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    --connect-timeout 5 --max-time 10 \
    --request POST "${APP_URL}/auth/login" \
    --header "Origin: ${APP_URL}" \
    --header 'Content-Type: application/json' \
    --data '{"email":"deployment-healthcheck@invalid.test","password":"invalid"}' || true)"

  if [[ "${status_code}" == "401" ]]; then
    backend_ready=true
    break
  fi
  sleep 5
done

if [[ "${backend_ready}" != "true" ]]; then
  echo "El backend no superó la verificación de autenticación."
  sudo docker logs --tail 120 roger-backend 2>&1 || true
  exit 1
fi

sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --no-deps frontend caddy

echo "Verificando la aplicación web..."
homepage=""
for _ in $(seq 1 24); do
  homepage="$(curl --fail --silent --show-error --connect-timeout 5 --max-time 10 "${APP_URL}/" || true)"
  if [[ -n "${homepage}" ]]; then
    break
  fi
  sleep 5
done

if [[ -z "${homepage}" ]]; then
  echo "El frontend no respondió."
  exit 1
fi

if grep -qi "Welcome to nginx" <<<"${homepage}"; then
  echo "El frontend está mostrando la página predeterminada de Nginx."
  exit 1
fi

sudo docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps
echo "Despliegue verificado: frontend y backend están operativos."

sudo docker image prune -f
