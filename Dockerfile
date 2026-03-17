# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Build the Next.js frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /app/frontend

# Native compilation tools required by bcrypt and hnswlib-node
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./

# Ensure public/ exists (Next.js requires it; project may not have one)
RUN mkdir -p public

# Build the Next.js production bundle (.next/)
RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Final runtime image  (Node.js only — Ollama runs as a separate
#           container via docker-compose using the official ollama/ollama image)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim

WORKDIR /app

# curl  – health-check Ollama and pull models via its HTTP API at startup
# python3, make, g++ – native Node addon compilation (bcrypt, hnswlib-node)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# ── Backend ───────────────────────────────────────────────────────────────────
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev --legacy-peer-deps

COPY backend/ ./backend/

# ── Frontend – production node_modules ───────────────────────────────────────
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --omit=dev --legacy-peer-deps

# Copy Next.js built output from Stage 1
COPY --from=frontend-builder /app/frontend/.next   ./frontend/.next
COPY --from=frontend-builder /app/frontend/public  ./frontend/public

# Config files needed at runtime by `next start`
COPY frontend/next.config.ts     ./frontend/
COPY frontend/tailwind.config.ts ./frontend/
COPY frontend/tsconfig.json      ./frontend/

# ── Startup script ────────────────────────────────────────────────────────────
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 4001 8080

# OLLAMA_BASE_URL is overridden in docker-compose to http://ollama:11434
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    OLLAMA_BASE_URL=http://localhost:11434

ENTRYPOINT ["/start.sh"]
