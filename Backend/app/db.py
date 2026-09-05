"""
Shared database dependency and engine setup for FastAPI application.
Provides a unified engine, AsyncSessionLocal, and get_db dependency.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

# Unified Async Engine (SQLite for local / asyncpg for prod)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

# Unified Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: yields an active async database session."""
    async with AsyncSessionLocal() as session:
        yield session

# Alias for backward compatibility
get_db_session = get_db
