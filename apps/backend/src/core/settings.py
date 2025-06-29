from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings for the application."""

    model_config = SettingsConfigDict(env_file=".env")

    OPENROUTER_API_KEY: str = Field(
        ..., description="The API key for the OpenRouter API"
    )
    OPENROUTER_BASE_URL: str = Field(
        "https://openrouter.ai/api/v1",
        description="The base URL for the OpenRouter API",
    )

    # Database settings
    DATABASE_URL: str = Field(
        "postgresql://user:password@localhost:5432/openchat",
        description="PostgreSQL database URL",
    )


@lru_cache
def get_settings() -> Settings:
    """Get the settings for the application."""
    return Settings()
