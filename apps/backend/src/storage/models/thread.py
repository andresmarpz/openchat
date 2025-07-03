from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import JSON, Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from src.storage.db import Base


class Thread(Base):
    """Thread model to store conversation threads, mimicking LangGraph's thread structure."""

    __tablename__ = "threads"

    # Primary key - UUID for thread identification
    thread_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Thread metadata
    created_at = Column(
        DateTime(timezone=True), default=datetime.now(UTC), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.now(UTC),
        onupdate=datetime.now(UTC),
        nullable=False,
    )

    # Thread configuration and state
    config = Column(JSON, nullable=True, default=dict)  # Thread configuration
    values = Column(JSON, nullable=True, default=dict)  # Current thread state/values
    thread_metadata = Column(JSON, nullable=True, default=dict)  # Additional metadata

    # Thread status and control
    status = Column(
        String(50), default="active", nullable=False
    )  # active, paused, completed, error

    # Optional thread name/title for user reference
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    # User/session association (if needed)
    user_id = Column(String(255), nullable=True)
    session_id = Column(String(255), nullable=True)

    # Archival and cleanup
    archived = Column(Boolean, default=False, nullable=False)

    def __repr__(self):
        """Representation class."""
        return f"<Thread(thread_id={self.thread_id}, status={self.status}, created_at={self.created_at})>"
