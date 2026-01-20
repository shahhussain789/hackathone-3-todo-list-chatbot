"""Application configuration using Pydantic Settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str

    # JWT / Auth
    better_auth_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 168  # 7 days

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Environment
    environment: str = "development"

    # OpenAI (optional - not required for rule-based chat)
    openai_api_key: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
