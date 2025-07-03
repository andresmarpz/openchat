from src.storage.db import DatabaseSessionManager
from src.storage.models.run import Run


class RunRepository:
    """Repository for Run entity operations."""

    def __init__(self, db_manager: DatabaseSessionManager):
        """Initialize the run repository."""
        self.db_manager = db_manager

    async def create(self, run: Run) -> Run:
        """Create a new run on a thread."""
        async with self.db_manager.session() as session:
            session.add(run)
            await session.commit()
            await session.refresh(run)

            return run

    async def get(self, run_id: str) -> Run | None:
        """Get a run by id."""
        async with self.db_manager.session() as session:
            return await session.get(Run, run_id)
