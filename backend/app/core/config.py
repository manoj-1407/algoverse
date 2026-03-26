from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    # No real credentials as defaults — must come from .env or environment
    DATABASE_URL: str = "postgresql://algoverse:change_me@localhost:5432/algoverse"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "dev_secret_change_in_production"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_prod(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
