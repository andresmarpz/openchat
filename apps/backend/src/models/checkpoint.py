from datetime import datetime
from typing import Dict, Any, Optional
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, Text, JSON, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.core.database import Base


class Checkpoint(Base):
    """Checkpoint model to store thread state snapshots, mimicking LangGraph's checkpoint system."""
    
    __tablename__ = "checkpoints"
    
    # Primary key
    checkpoint_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Foreign key to thread
    thread_id = Column(UUID(as_uuid=True), ForeignKey("threads.thread_id"), nullable=False)
    
    # Checkpoint sequencing and identification
    checkpoint_ns = Column(String(255), nullable=False, default="")  # Checkpoint namespace
    checkpoint_version = Column(Integer, nullable=False, default=1)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Checkpoint data - the actual state snapshot
    data = Column(JSON, nullable=False, default=dict)  # Full state snapshot
    checkpoint_metadata = Column(JSON, nullable=True, default=dict)  # Checkpoint metadata
    
    # Parent checkpoint for versioning/branching
    parent_checkpoint_id = Column(UUID(as_uuid=True), ForeignKey("checkpoints.checkpoint_id"), nullable=True)
    
    # Checkpoint type/category
    checkpoint_type = Column(String(100), default="state", nullable=False)  # state, error, milestone, etc.
    
    # Optional description
    description = Column(Text, nullable=True)
    
    # Relationships
    thread = relationship("Thread", backref="checkpoints")
    parent_checkpoint = relationship("Checkpoint", remote_side=[checkpoint_id], backref="child_checkpoints")
    
    def __repr__(self):
        return f"<Checkpoint(checkpoint_id={self.checkpoint_id}, thread_id={self.thread_id}, version={self.checkpoint_version})>"


class CheckpointWrite(Base):
    """Model to track checkpoint write operations and pending writes."""
    
    __tablename__ = "checkpoint_writes"
    
    # Primary key
    write_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Associated checkpoint
    checkpoint_id = Column(UUID(as_uuid=True), ForeignKey("checkpoints.checkpoint_id"), nullable=False)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("threads.thread_id"), nullable=False)
    
    # Write metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    task_id = Column(String(255), nullable=True)  # Associated task identifier
    
    # Write data
    writes = Column(JSON, nullable=False, default=list)  # List of write operations
    
    # Write status
    status = Column(String(50), default="pending", nullable=False)  # pending, completed, failed
    
    # Relationships
    checkpoint = relationship("Checkpoint", backref="writes")
    thread = relationship("Thread")
    
    def __repr__(self):
        return f"<CheckpointWrite(write_id={self.write_id}, checkpoint_id={self.checkpoint_id}, status={self.status})>"