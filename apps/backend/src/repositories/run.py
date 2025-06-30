from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.models.run import Run
from .base import BaseRepository


class RunRepository(BaseRepository[Run]):
    """Repository for Run entity operations."""

    def __init__(self, db: Session):
        super().__init__(db, Run)

    def create(
        self,
        thread_id: UUID,
        run_name: Optional[str] = None,
        run_type: str = "execution",
        config: Optional[dict] = None,
        input_data: Optional[dict] = None,
        run_metadata: Optional[dict] = None,
        parent_run_id: Optional[UUID] = None,
        status: str = "pending",
        **kwargs,
    ) -> Run:
        """Create a new run."""
        run = Run(
            thread_id=thread_id,
            run_name=run_name,
            run_type=run_type,
            config=config or {},
            input_data=input_data or {},
            run_metadata=run_metadata or {},
            parent_run_id=parent_run_id,
            status=status,
            **kwargs,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def get_by_id(self, run_id: UUID) -> Optional[Run]:
        """Get run by ID."""
        return self.db.query(Run).filter(Run.run_id == run_id).first()

    def get_by_thread_id(
        self, thread_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Run]:
        """Get runs by thread ID."""
        return (
            self.db.query(Run)
            .filter(Run.thread_id == thread_id)
            .order_by(Run.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_parent_run_id(self, parent_run_id: UUID) -> List[Run]:
        """Get child runs by parent run ID."""
        return (
            self.db.query(Run)
            .filter(Run.parent_run_id == parent_run_id)
            .order_by(Run.created_at.asc())
            .all()
        )

    def get_active_runs(self, skip: int = 0, limit: int = 100) -> List[Run]:
        """Get all active (running or pending) runs."""
        return (
            self.db.query(Run)
            .filter(Run.status.in_(["pending", "running"]))
            .order_by(Run.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_runs_by_status(
        self, status: str, skip: int = 0, limit: int = 100
    ) -> List[Run]:
        """Get runs by status."""
        return (
            self.db.query(Run)
            .filter(Run.status == status)
            .order_by(Run.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_runs_by_type(
        self, run_type: str, skip: int = 0, limit: int = 100
    ) -> List[Run]:
        """Get runs by type."""
        return (
            self.db.query(Run)
            .filter(Run.run_type == run_type)
            .order_by(Run.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def start_run(self, run_id: UUID) -> Optional[Run]:
        """Start a run (update status and started_at)."""
        run = self.get_by_id(run_id)
        if run and run.status == "pending":
            run.status = "running"
            run.started_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(run)
        return run

    def complete_run(
        self,
        run_id: UUID,
        status: str = "completed",
        output_data: Optional[dict] = None,
        cpu_time: Optional[float] = None,
        memory_usage: Optional[float] = None,
    ) -> Optional[Run]:
        """Complete a run with results."""
        run = self.get_by_id(run_id)
        if run and run.status == "running":
            run.status = status
            run.completed_at = datetime.utcnow()
            run.progress = 100.0
            if output_data is not None:
                run.output_data = output_data
            if cpu_time is not None:
                run.cpu_time = cpu_time
            if memory_usage is not None:
                run.memory_usage = memory_usage
            self.db.commit()
            self.db.refresh(run)
        return run

    def update_progress(self, run_id: UUID, progress: float) -> Optional[Run]:
        """Update run progress."""
        run = self.get_by_id(run_id)
        if run:
            run.progress = max(0.0, min(100.0, progress))  # Clamp between 0-100
            self.db.commit()
            self.db.refresh(run)
        return run

    def update_status(self, run_id: UUID, status: str) -> Optional[Run]:
        """Update run status."""
        run = self.get_by_id(run_id)
        if run:
            run.status = status
            if status in ["completed", "failed", "cancelled"] and not run.completed_at:
                run.completed_at = datetime.utcnow()
                run.progress = 100.0 if status == "completed" else run.progress
            self.db.commit()
            self.db.refresh(run)
        return run

    def cancel_run(self, run_id: UUID) -> Optional[Run]:
        """Cancel a running run."""
        return self.update_status(run_id, "cancelled")

    def get_recent_runs(
        self, thread_id: Optional[UUID] = None, limit: int = 10
    ) -> List[Run]:
        """Get recent runs, optionally filtered by thread."""
        query = self.db.query(Run)
        if thread_id:
            query = query.filter(Run.thread_id == thread_id)
        return query.order_by(Run.created_at.desc()).limit(limit).all()

    def get_run_statistics(self, thread_id: Optional[UUID] = None) -> dict:
        """Get run statistics, optionally filtered by thread."""
        query = self.db.query(Run)
        if thread_id:
            query = query.filter(Run.thread_id == thread_id)

        total_runs = query.count()
        completed_runs = query.filter(Run.status == "completed").count()
        failed_runs = query.filter(Run.status == "failed").count()
        running_runs = query.filter(Run.status == "running").count()
        pending_runs = query.filter(Run.status == "pending").count()

        return {
            "total": total_runs,
            "completed": completed_runs,
            "failed": failed_runs,
            "running": running_runs,
            "pending": pending_runs,
            "success_rate": (completed_runs / total_runs * 100)
            if total_runs > 0
            else 0,
        }

    def cleanup_old_runs(self, days_old: int = 30) -> int:
        """Clean up runs older than specified days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        old_runs = (
            self.db.query(Run)
            .filter(
                Run.created_at < cutoff_date,
                Run.status.in_(["completed", "failed", "cancelled"]),
            )
            .all()
        )

        count = len(old_runs)
        for run in old_runs:
            self.db.delete(run)

        self.db.commit()
        return count

    def _get_id_column(self) -> str:
        """Get the name of the ID column for Run model."""
        return "run_id"
