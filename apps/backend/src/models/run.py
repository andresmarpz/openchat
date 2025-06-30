from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.core.database import Base


class Run(Base):
    """Run model to track execution runs within threads, similar to LangGraph's run u."""

    __tablename__ = "runs"

    # Primary key
    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Associated thread
    thread_id = Column(
        UUID(as_uuid=True), ForeignKey("threads.thread_id"), nullable=False
    )

    # Run identification and metadata
    run_name = Column(String(255), nullable=True)
    run_type = Column(
        String(100), default="execution", nullable=False
    )  # execution, test, debug, etc.

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Run status and progress
    status = Column(
        String(50), default="pending", nullable=False
    )  # pending, running, completed, failed, cancelled
    progress = Column(
        Float, default=0.0, nullable=False
    )  # Progress percentage (0.0 to 100.0)

    # Run configuration and results
    config = Column(JSON, nullable=True, default=dict)  # Run configuration
    input_data = Column(JSON, nullable=True, default=dict)  # Input parameters
    output_data = Column(JSON, nullable=True, default=dict)  # Output results
    run_metadata = Column(JSON, nullable=True, default=dict)  # Additional metadata

    # Parent run for nested/sub-runs
    parent_run_id = Column(UUID(as_uuid=True), ForeignKey("runs.run_id"), nullable=True)

    # Resource usage tracking
    cpu_time = Column(Float, nullable=True)  # CPU time in seconds
    memory_usage = Column(Float, nullable=True)  # Memory usage in MB

    # Relationships
    thread = relationship("Thread", backref="runs")
    parent_run = relationship("Run", remote_side=[run_id], backref="child_runs")

    def __repr__(self):
        """Representation function."""
        return f"<Run(run_id={self.run_id}, thread_id={self.thread_id}, status={self.status})>"

    @property
    def duration(self) -> float | None:
        """Calculate run duration in seconds."""
        if self.started_at is not None and self.completed_at is not None:
            return (self.completed_at - self.started_at).total_seconds()
        return None

    @property
    def is_running(self) -> bool:
        """Check if the run is currently active."""
        return self.status in ["pending", "running"]

    @property
    def is_completed(self) -> bool:
        """Check if the run has completed (successfully or with error)."""
        return self.status in ["completed", "failed", "cancelled"]
