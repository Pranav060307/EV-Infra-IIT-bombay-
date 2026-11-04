import os
import sys
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ChargeAtlas India"
    APP_ENV: str = "development"  # 'development', 'testing', 'production'
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Security & Authentication
    SECRET_KEY: str = "chargeatlas-production-secret-key-change-in-production-vault-8896"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ADMIN_API_KEY: str = "chargeatlas-admin-internal-key-2026"

    # CORS Allowed Origins
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:80"
    
    # Database Settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "chargeatlas_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_ENGINE_MODE: str = "auto"  # 'auto', 'postgres', or 'sqlite'
    
    # Data Mode
    SYNTHETIC_DATA_MODE: bool = False

    # Upload & File Restrictions
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB limit
    ALLOWED_UPLOAD_EXTENSIONS: str = ".csv,.xlsx,.xls,.geojson,.json"

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    MAX_REQUESTS_PER_MINUTE: int = 180

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def allowed_extensions(self) -> List[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_UPLOAD_EXTENSIONS.split(",") if ext.strip()]

    @property
    def postgres_url(self) -> str:
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def sqlite_url(self) -> str:
        if self.APP_ENV == "testing" or "PYTEST_CURRENT_TEST" in os.environ or "pytest" in sys.modules:
            test_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "chargeatlas_test.db"))
            return f"sqlite:///{test_db.replace(os.sep, '/')}"
        root_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "chargeatlas_dev.db"))
        return f"sqlite:///{root_db.replace(os.sep, '/')}"

    class Config:
        env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
        extra = "allow"

settings = Settings()
