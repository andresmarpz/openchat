from contextlib import contextmanager
from typing import Generator

from sqlalchemy.orm import Session

from src.core.database import SessionLocal
from src.repositories import RunRepository, ThreadRepository


class RepositoryService:
    """Service for managing repository instances with database sessions."""

    def __init__(self, db: Session):
        self.db = db
        self._thread_repo = None
        self._run_repo = None

    @property
    def threads(self) -> ThreadRepository:
        """Get ThreadRepository instance."""
        if self._thread_repo is None:
            self._thread_repo = ThreadRepository(self.db)
        return self._thread_repo

    @property
    def runs(self) -> RunRepository:
        """Get RunRepository instance."""
        if self._run_repo is None:
            self._run_repo = RunRepository(self.db)
        return self._run_repo

    def close(self):
        """Close the database session."""
        self.db.close()


@contextmanager
def get_repository_service() -> Generator[RepositoryService, None, None]:
    """Context manager for getting a repository service with automatic session management."""
    db = SessionLocal()
    service = RepositoryService(db)
    try:
        yield service
    finally:
        service.close()


def get_repositories(db: Session) -> RepositoryService:
    """Get repository service for dependency injection."""
    return RepositoryService(db)
