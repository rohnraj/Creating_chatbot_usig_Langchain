#!/usr/bin/env bash
# =============================================================================
# start.sh – Container entrypoint
# Starts: waits for Ollama → pulls models via API → backend → frontend
#
# Ollama itself runs as a SEPARATE container (ollama/ollama via docker-compose).
# This script connects to it over the Docker network using $OLLAMA_BASE_URL.
# =============================================================================
set -euo pipefail

GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; RESET="\033[0m"
info()  { echo -e "${GREEN}[INFO]${RESET}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error() { echo -e "${RED}[ERROR]${RESET} $*" >&2; }

OLLAMA_URL="${OLLAMA_BASE_URL:-http://localhost:11434}"

# ── 1. Wait for Ollama service ────────────────────────────────────────────────
info "Waiting for Ollama at ${OLLAMA_URL} ..."
MAX_WAIT=120
elapsed=0
until curl -sf "${OLLAMA_URL}/api/tags" > /dev/null 2>&1; do
    if [ "$elapsed" -ge "$MAX_WAIT" ]; then
        error "Ollama did not become ready within ${MAX_WAIT}s."
        error "Make sure the ollama service is running (see docker-compose.yml)."
        exit 1
    fi
    sleep 3
    elapsed=$((elapsed + 3))
done
info "Ollama is ready."

# ── 2. Pull models via Ollama HTTP API (no ollama binary needed) ──────────────
# Uses POST /api/pull with stream:false so we wait for completion.
pull_if_missing() {
    local model="$1"
    # /api/show returns 404 if the model is not present
    if curl -sf "${OLLAMA_URL}/api/show" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"${model}\"}" > /dev/null 2>&1; then
        info "Model '${model}' already present — skipping."
    else
        warn "Pulling model '${model}' (first run — may take several minutes)..."
        curl -sf "${OLLAMA_URL}/api/pull" \
             -H "Content-Type: application/json" \
             -d "{\"name\":\"${model}\",\"stream\":false}" > /dev/null
        info "Model '${model}' ready."
    fi
}

pull_if_missing "mistral"
pull_if_missing "nomic-embed-text"

# ── 3. Start Express backend ──────────────────────────────────────────────────
info "Starting Express backend on port 8080..."
cd /app/backend
node server.js &
BACKEND_PID=$!
sleep 2
info "Backend started (PID: ${BACKEND_PID})."

# ── 4. Start Next.js frontend ─────────────────────────────────────────────────
info "Starting Next.js frontend on port 4001..."
cd /app/frontend
npm start &
FRONTEND_PID=$!
sleep 2
info "Frontend started (PID: ${FRONTEND_PID})."

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║          Chat Assistant is running                   ║${RESET}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${RESET}"
echo -e "${GREEN}║  Frontend  →  http://localhost:4001                  ║${RESET}"
echo -e "${GREEN}║  Backend   →  http://localhost:8080                  ║${RESET}"
echo -e "${GREEN}║  Ollama    →  ${OLLAMA_URL}          ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Graceful shutdown ─────────────────────────────────────────────────────────
cleanup() {
    warn "Shutting down..."
    kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
    info "Stopped."
    exit 0
}
trap cleanup SIGTERM SIGINT

wait -n "$FRONTEND_PID" "$BACKEND_PID"
error "A service exited unexpectedly."
cleanup
