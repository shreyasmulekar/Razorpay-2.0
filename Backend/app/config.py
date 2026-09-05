from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Swapped from PostgreSQL to local SQLite
    DATABASE_URL: str = "sqlite+aiosqlite:///./gateway_core.db"
    # Gemini AI — set in .env as GEMINI_API_KEY=your_key_here
    GEMINI_API_KEY: str = ""

settings = Settings()