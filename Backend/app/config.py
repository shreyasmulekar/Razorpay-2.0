from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Swapped from PostgreSQL to local SQLite
    DATABASE_URL: str = "sqlite+aiosqlite:///./gateway_core.db"

settings = Settings()