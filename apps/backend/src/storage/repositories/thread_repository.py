from src.storage.db import DatabaseSessionManager
from src.storage.models.thread import Thread


class ThreadRepository:
    """Repository for Thread entity operations."""

    def __init__(self, db_manager: DatabaseSessionManager):
        """Initialize the thread repository."""
        self.db_manager = db_manager

    async def create(
        self,
        thread: Thread,
    ) -> Thread:
        """Create a new thread."""
        async with self.db_manager.session() as session:
            session.add(thread)
            await session.commit()
            await session.refresh(thread)

        return thread

    async def get(self, thread_id: str) -> Thread | None:
        """Get a thread by id."""
        async with self.db_manager.session() as session:
            return await session.get(Thread, thread_id)

    async def update(self, thread: Thread) -> Thread:
        """Update a thread."""
        async with self.db_manager.session() as session:
            session.add(thread)
            await session.commit()
            await session.refresh(thread)

        return thread
