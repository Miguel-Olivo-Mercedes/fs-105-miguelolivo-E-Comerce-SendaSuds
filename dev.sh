#!/usr/bin/env bash
set -Eeuo pipefail

# Matar procesos previos en los puertos (si los hay)
( lsof -ti:5000 2>/dev/null | xargs -r kill -9 ) || true
( lsof -ti:5173 2>/dev/null | xargs -r kill -9 ) || true

# Lanzar API
(
  cd api
  # Crear/activar venv e instalar deps
  if [ ! -d .venv ]; then python -m venv .venv; fi
  source .venv/bin/activate
  pip -q install -r requirements.txt
  # Cargar .env si existe (opcional)
  [ -f .env ] && set -a && . .env && set +a
  # Ejecutar en 0.0.0.0:5000 para Codespaces
  python app.py
) & API_PID=$!

# Lanzar Web
(
  cd web
  npm install --silent
  # Forzar puerto 5173 y exponer --host para Codespaces
  npm run dev -- --host --port 5173
) & WEB_PID=$!

# Limpieza al salir
cleanup() {
  kill "$API_PID" "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "✅ Backend en http://localhost:5000"
echo "✅ Frontend en  http://localhost:5173"
echo "Presiona Ctrl+C para parar ambos."
wait -n
