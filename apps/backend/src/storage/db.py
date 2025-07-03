import contextlib
from typing import Any, AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from src.core.settings import get_settings

settings = get_settings()


Base = declarative_base()


class DatabaseSessionManager:
    """Database session manager."""

    def __init__(self, host: str, engine_kwargs: dict[str, Any] = {}):
        """Initialize the database session manager."""
        self._engine = create_async_engine(host, **engine_kwargs)
        self._sessionmaker = async_sessionmaker(autocommit=False, bind=self._engine)

    async def close(self):
        """Close the database session."""
        if self._engine is None:
            raise Exception("DatabaseSessionManager is not initialized")
        await self._engine.dispose()

        self._engine = None
        self._sessionmaker = None

    @contextlib.asynccontextmanager
    async def connect(self) -> AsyncIterator[AsyncConnection]:
        """Connect to the database."""
        if self._engine is None:
            raise Exception("DatabaseSessionManager is not initialized")

        async with self._engine.begin() as connection:
            try:
                yield connection
            except Exception:
                await connection.rollback()
                raise

    @contextlib.asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        """Get a new database session."""
        if self._sessionmaker is None:
            raise Exception("DatabaseSessionManager is not initialized")

        session = self._sessionmaker()
        yield session
        await session.close()


# --- SINGLETON DATABASE SESSION MANAGER ---
# This singleton instance ensures only one engine and sessionmaker are created for the app lifetime.
# Best practice: Engine creation is expensive and should be done once per app. Connection pooling is managed by the engine.
# All repositories/services should use this singleton for session creation.
sessionmanager = DatabaseSessionManager(settings.DATABASE_URL, {"echo": True})


async def get_db_session() -> AsyncIterator[AsyncSession]:
    """Get a new database session."""
    async with sessionmanager.session() as session:
        yield session
