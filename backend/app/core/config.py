import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ChargeAtlas India"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "chargeatlas_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_ENGINE_MODE: str = "auto"  # 'auto', 'postgres', or 'sqlite'
    
    SYNTHETIC_DATA_MODE: bool = True

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def postgres_url(self) -> str:
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def sqlite_url(self) -> str:
        return "sqlite:///./chargeatlas_dev.db"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

