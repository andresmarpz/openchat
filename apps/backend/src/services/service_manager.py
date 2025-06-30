from contextlib import contextmanager
from typing import Generator

from sqlalchemy.orm import Session

from src.core.database import SessionLocal
from .run_service import RunService
from .thread_service import ThreadService


class ServiceManager:
    """Manager for all business logic services with database session handling."""

    def __init__(self, db: Session):
        self.db = db
        self._thread_service = None
        self._run_service = None

    @property
    def threads(self) -> ThreadService:
        """Get ThreadService instance."""
        if self._thread_service is None:
            self._thread_service = ThreadService(self.db)
        return self._thread_service

    @property
    def runs(self) -> RunService:
        """Get RunService instance."""
        if self._run_service is None:
            self._run_service = RunService(self.db)
        return self._run_service

    def close(self):
        """Close the database session."""
        self.db.close()


@contextmanager
def get_service_manager() -> Generator[ServiceManager, None, None]:
    """Context manager for getting a service manager with automatic session management."""
    db = SessionLocal()
    manager = ServiceManager(db)
    try:
        yield manager
    finally:
        manager.close()


def get_services(db: Session) -> ServiceManager:
    """Get service manager for dependency injection in FastAPI."""
    return ServiceManager(db)