import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("chargeatlas.database")

Base = declarative_base()

def get_engine():
    """
    Initializes database engine.
    If mode is 'auto', it tests PostgreSQL connection first;
    if unreachable, it seamlessly falls back to SQLite so local development is never blocked.
    """
    if settings.DB_ENGINE_MODE == "postgres":
        try:
            engine = create_engine(settings.postgres_url, pool_pre_ping=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected to PostgreSQL successfully.")
            return engine, "postgresql"
        except Exception as e:
            logger.error(f"Failed to connect to PostgreSQL: {e}")
            raise e

    elif settings.DB_ENGINE_MODE == "sqlite":
        engine = create_engine(settings.sqlite_url, connect_args={"check_same_thread": False})
        logger.info("Using SQLite database engine.")
        return engine, "sqlite"

    else:  # 'auto'
        try:
            engine = create_engine(
                settings.postgres_url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3}
            )
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Auto-detected and connected to PostgreSQL.")
            return engine, "postgresql"
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection unavailable ({e}). "
                f"Falling back to local SQLite engine for development."
            )
            engine = create_engine(settings.sqlite_url, connect_args={"check_same_thread": False})
            return engine, "sqlite_fallback"

engine, active_engine_type = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Creates all tables in the active database engine.
    Safe to run repeatedly.
    """
    import app.models  # Ensure all models are registered with Base.metadata
    Base.metadata.create_all(bind=engine)
    logger.info(f"Initialized database tables on {active_engine_type}.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

