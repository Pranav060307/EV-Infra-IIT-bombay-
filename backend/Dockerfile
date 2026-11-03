# ==============================================================================
# CHARGEATLAS INDIA — BACKEND PRODUCTION DOCKERFILE
# Multi-stage containerized build with security hardening & non-root user
# ==============================================================================

FROM python:3.11-slim as base

# Set environment flags
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies (libpq for PostgreSQL, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY app/ ./app/
COPY scripts/ ./scripts/
COPY tests/ ./tests/
COPY alembic.ini .
COPY alembic/ ./alembic/

# Create non-root system user and prepare directories
RUN addgroup --system chargeatlas && adduser --system --group chargeatlas \
    && mkdir -p /app/data/staging \
    && chown -R chargeatlas:chargeatlas /app

USER chargeatlas

# Expose FastAPI ASGI port
EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production ASGI server launch with 4 worker processes
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers", "--forwarded-allow-ips", "*"]

