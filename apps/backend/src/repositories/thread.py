from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.models.thread import Thread
from .base import BaseRepository


class ThreadRepository(BaseRepository[Thread]):
    """Repository for Thread entity operations."""

    def __init__(self, db: Session):
        super().__init__(db, Thread)

    def create(
        self,
        name: Optional[str] = None,
        description: Optional[str] = None,
        config: Optional[dict] = None,
        values: Optional[dict] = None,
        thread_metadata: Optional[dict] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        status: str = "active",
        **kwargs,
    ) -> Thread:
        """Create a new thread."""
        thread = Thread(
            name=name,
            description=description,
            config=config or {},
            values=values or {},
            thread_metadata=thread_metadata or {},
            user_id=user_id,
            session_id=session_id,
            status=status,
            **kwargs,
        )
        self.db.add(thread)
        self.db.commit()
        self.db.refresh(thread)
        return thread

    def get_by_id(self, thread_id: UUID) -> Optional[Thread]:
        """Get thread by ID."""
        return self.db.query(Thread).filter(Thread.thread_id == thread_id).first()

    def get_by_user_id(
        self, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[Thread]:
        """Get threads by user ID."""
        return (
            self.db.query(Thread)
            .filter(Thread.user_id == user_id, Thread.archived == False)
            .order_by(Thread.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_session_id(self, session_id: str) -> List[Thread]:
        """Get threads by session ID."""
        return (
            self.db.query(Thread)
            .filter(Thread.session_id == session_id, Thread.archived == False)
            .order_by(Thread.updated_at.desc())
            .all()
        )

    def get_active_threads(self, skip: int = 0, limit: int = 100) -> List[Thread]:
        """Get all active (non-archived) threads."""
        return (
            self.db.query(Thread)
            .filter(Thread.archived == False, Thread.status == "active")
            .order_by(Thread.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def archive_thread(self, thread_id: UUID) -> Optional[Thread]:
        """Archive a thread (soft delete)."""
        thread = self.get_by_id(thread_id)
        if thread:
            thread.archived = True
            thread.status = "completed"
            thread.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(thread)
        return thread

    def update_status(self, thread_id: UUID, status: str) -> Optional[Thread]:
        """Update thread status."""
        thread = self.get_by_id(thread_id)
        if thread:
            thread.status = status
            thread.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(thread)
        return thread

    def update_values(self, thread_id: UUID, values: dict) -> Optional[Thread]:
        """Update thread values/state."""
        thread = self.get_by_id(thread_id)
        if thread:
            thread.values = values
            thread.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(thread)
        return thread

    def search_by_name(
        self, name_pattern: str, skip: int = 0, limit: int = 100
    ) -> List[Thread]:
        """Search threads by name pattern."""
        return (
            self.db.query(Thread)
            .filter(Thread.name.ilike(f"%{name_pattern}%"), Thread.archived == False)
            .order_by(Thread.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_threads_by_status(
        self, status: str, skip: int = 0, limit: int = 100
    ) -> List[Thread]:
        """Get threads by status."""
        return (
            self.db.query(Thread)
            .filter(Thread.status == status, Thread.archived == False)
            .order_by(Thread.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def _get_id_column(self) -> str:
        """Get the name of the ID column for Thread model."""
        return "thread_id"
