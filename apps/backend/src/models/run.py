from datetime import datetime
from typing import Dict, Any, Optional
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean, ForeignKey, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.core.database import Base


class Run(Base):
    """Run model to track execution runs within threads, similar to LangGraph's run concept."""
    
    __tablename__ = "runs"
    
    # Primary key
    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Associated thread
    thread_id = Column(UUID(as_uuid=True), ForeignKey("threads.thread_id"), nullable=False)
    
    # Run identification and metadata
    run_name = Column(String(255), nullable=True)
    run_type = Column(String(100), default="execution", nullable=False)  # execution, test, debug, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Run status and progress
    status = Column(String(50), default="pending", nullable=False)  # pending, running, completed, failed, cancelled
    progress = Column(Float, default=0.0, nullable=False)  # Progress percentage (0.0 to 100.0)
    
    # Run configuration and results
    config = Column(JSON, nullable=True, default=dict)  # Run configuration
    input_data = Column(JSON, nullable=True, default=dict)  # Input parameters
    output_data = Column(JSON, nullable=True, default=dict)  # Output results
    run_metadata = Column(JSON, nullable=True, default=dict)  # Additional metadata
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)
    
    # Parent run for nested/sub-runs
    parent_run_id = Column(UUID(as_uuid=True), ForeignKey("runs.run_id"), nullable=True)
    
    # Resource usage tracking
    cpu_time = Column(Float, nullable=True)  # CPU time in seconds
    memory_usage = Column(Float, nullable=True)  # Memory usage in MB
    
    # Relationships
    thread = relationship("Thread", backref="runs")
    parent_run = relationship("Run", remote_side=[run_id], backref="child_runs")
    
    def __repr__(self):
        return f"<Run(run_id={self.run_id}, thread_id={self.thread_id}, status={self.status})>"
    
    @property
    def duration(self) -> Optional[float]:
        """Calculate run duration in seconds."""
        if self.started_at and self.completed_at:
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


class Task(Base):
    """Task model to represent individual tasks within runs."""
    
    __tablename__ = "tasks"
    
    # Primary key
    task_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Associated run
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.run_id"), nullable=False)
    
    # Task identification
    task_name = Column(String(255), nullable=False)
    task_type = Column(String(100), nullable=False)  # llm_call, function_call, tool_use, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Task status
    status = Column(String(50), default="pending", nullable=False)  # pending, running, completed, failed
    
    # Task data
    input_data = Column(JSON, nullable=True, default=dict)
    output_data = Column(JSON, nullable=True, default=dict)
    task_metadata = Column(JSON, nullable=True, default=dict)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)
    
    # Task ordering and dependencies
    sequence_order = Column(Integer, nullable=True)
    depends_on = Column(JSON, nullable=True, default=list)  # List of task_ids this task depends on
    
    # Relationships
    run = relationship("Run", backref="tasks")
    
    def __repr__(self):
        return f"<Task(task_id={self.task_id}, run_id={self.run_id}, task_name={self.task_name}, status={self.status})>"