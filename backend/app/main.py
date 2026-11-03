import time
import logging
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.api.v1.api_router import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("chargeatlas")

# In-memory sliding-window rate limiter
client_request_history = defaultdict(list)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ChargeAtlas India Platform Backend...")
    logger.info(f"Environment: {settings.APP_ENV} | Engine Mode: {settings.DB_ENGINE_MODE} | Debug: {settings.DEBUG}")
    
    # Initialize database tables and seed baseline admin user
    try:
        init_db()
        from app.models.entities import User
        from app.core.security import hash_password
        db = SessionLocal()
        try:
            admin_user = db.query(User).filter(User.username == "admin").first()
            if not admin_user:
                admin_user = User(
                    id="USR-ADMIN-DEFAULT",
                    username="admin",
                    email="admin@chargeatlas.gov.in",
                    hashed_password=hash_password("Admin@2026!"),
                    full_name="IIT Bombay Techfest Evaluator (Admin)",
                    role="admin",
                    is_active=True
                )
                db.add(admin_user)
                db.commit()
                logger.info("Initialized default evaluation admin account (admin / Admin@2026!).")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Database initialization notice during lifespan: {e}")
        
    yield
    logger.info("Shutting down ChargeAtlas India Platform Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Enterprise GIS-based decision-support platform for EV Charging Infrastructure "
        "Mapping, Gap Analysis, Demand Forecasting & Smart Site Recommendations across India."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# ------------------------------------------------------------------------------
# Security Headers & Request Auditing Middleware
# ------------------------------------------------------------------------------
@app.middleware("http")
async def security_and_audit_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"

    # 1. Rate Limiting Check (Simple In-Memory Sliding Window)
    if settings.RATE_LIMIT_ENABLED and request.url.path.startswith(f"{settings.API_V1_STR}/auth"):
        now = time.time()
        window_start = now - 60.0
        # Prune older timestamps
        client_request_history[client_ip] = [ts for ts in client_request_history[client_ip] if ts > window_start]
        if len(client_request_history[client_ip]) >= settings.MAX_REQUESTS_PER_MINUTE:
            logger.warning(f"Rate limit exceeded for client IP {client_ip} on {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please slow down and try again shortly."}
            )
        client_request_history[client_ip].append(now)

    # 2. Process Request
    try:
        response: Response = await call_next(request)
    except Exception as exc:
        logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred. Please contact the platform administrator."}
        )

    duration_ms = (time.time() - start_time) * 1000.0

    # 3. Apply Hardened Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), microphone=(), camera=()"
    response.headers["X-Processed-Time-Ms"] = f"{duration_ms:.2f}"
    
    if settings.APP_ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # 4. Structured Audit Log
    # Never log query params containing keys/tokens or Authorization headers
    if not request.url.path.startswith("/health") and not request.url.path.startswith("/docs"):
        logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms:.1f}ms) [client: {client_ip}]")

    return response

# Set up resilient CORS for React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["X-Processed-Time-Ms"]
)

# Register API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to ChargeAtlas India Analytical Platform API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "environment": settings.APP_ENV,
        "database_engine": settings.DB_ENGINE_MODE,
        "project": "Techfest 2026-27 | EV Infra Map India Challenge (MHI & ICAT)",
        "team": "SuperNova - Sanjivani University"
    }

@app.get("/health", tags=["Root"])
def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
