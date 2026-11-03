import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("chargeatlas.database")

Base = declarative_base()

def get_engine():
    """
    Initializes database engine with strict environment segregation:
    1. In production ('production'), PostgreSQL/PostGIS is MANDATORY.
       Silent fallback to SQLite is strictly prohibited to guarantee data persistence and spatial indexing.
    2. In development or testing, auto-fallback to SQLite is permitted if PostgreSQL is unreachable.
    """
    if settings.APP_ENV == "production":
        logger.info(f"Production environment active: connecting to PostgreSQL database '{settings.DB_NAME}' at {settings.DB_HOST}:{settings.DB_PORT}...")
        try:
            engine = create_engine(
                settings.postgres_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 5}
            )
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected to Production PostgreSQL database successfully.")
            return engine, "postgresql"
        except Exception as e:
            logger.critical(f"FATAL: Production database connection to PostgreSQL failed: {e}. Falling back to SQLite is prohibited in production mode.")
            raise RuntimeError(
                f"Production database connection failed: PostgreSQL at {settings.DB_HOST}:{settings.DB_PORT} "
                f"is unreachable. SQLite fallback is disabled in production."
            ) from e

    elif settings.DB_ENGINE_MODE == "postgres":
        try:
            engine = create_engine(
                settings.postgres_url,
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
                connect_args={"connect_timeout": 3}
            )
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected to PostgreSQL successfully.")
            return engine, "postgresql"
        except Exception as e:
            logger.error(f"Failed to connect to PostgreSQL: {e}")
            raise e

    elif settings.DB_ENGINE_MODE == "sqlite":
        engine = create_engine(
            settings.sqlite_url, 
            connect_args={"check_same_thread": False, "timeout": 30}
        )
        logger.info("Using SQLite database engine (Development).")
        return engine, "sqlite"

    else:  # 'auto' mode in development/testing
        try:
            engine = create_engine(
                settings.postgres_url,
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
                connect_args={"connect_timeout": 2}
            )
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Auto-detected and connected to PostgreSQL.")
            return engine, "postgresql"
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection unavailable on port {settings.DB_PORT} ({e}). "
                f"Active development mode: Falling back to local SQLite engine."
            )
            engine = create_engine(
                settings.sqlite_url, 
                connect_args={"check_same_thread": False, "timeout": 30}
            )
            return engine, "sqlite_fallback"

engine, active_engine_type = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if "sqlite" in active_engine_type:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

def init_db():
    """
    Creates all tables in the active database engine.
    Safe to run repeatedly.
    """
    import app.models.entities  # Ensure all models are registered with Base.metadata
    Base.metadata.create_all(bind=engine)
    logger.info(f"Initialized database tables on {active_engine_type}.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
