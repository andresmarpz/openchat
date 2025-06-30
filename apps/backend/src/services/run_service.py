from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.models.run import Run
from src.repositories.run import RunRepository
from src.repositories.thread import ThreadRepository
from .base import BaseService


class RunService(BaseService):
    """Service for Run business logic operations."""

    def __init__(self, db: Session):
        super().__init__(db)
        self._run_repository = RunRepository(db)
        self._thread_repository = ThreadRepository(db)

    def _get_repository(self) -> RunRepository:
        """Get the RunRepository instance."""
        return self._run_repository

    def create_run(
        self,
        thread_id: UUID,
        input_data: Dict[str, Any],
        run_name: Optional[str] = None,
        run_type: str = "execution",
        config: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
        parent_run_id: Optional[UUID] = None
    ) -> Run:
        """Create a new run for a thread."""
        try:
            # Validate thread exists
            thread = self._thread_repository.get_by_id(thread_id)
            if not thread:
                raise ValueError(f"Thread with ID {thread_id} not found")

            if thread.archived:
                raise ValueError("Cannot create runs for archived threads")

            # Validate input data
            if not isinstance(input_data, dict):
                raise ValueError("input_data must be a dictionary")

            # Set default run name if not provided
            if not run_name:
                run_name = f"Run {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"

            # Validate parent run if provided
            if parent_run_id:
                parent_run = self._run_repository.get_by_id(parent_run_id)
                if not parent_run:
                    raise ValueError(f"Parent run with ID {parent_run_id} not found")
                if parent_run.thread_id != thread_id:
                    raise ValueError("Parent run must belong to the same thread")

            # Prepare run data
            run_data = {
                "thread_id": thread_id,
                "run_name": run_name,
                "run_type": run_type,
                "input_data": input_data,
                "config": config or {},
                "run_metadata": metadata or {},
                "parent_run_id": parent_run_id,
                "status": "pending"
            }

            # Validate input
            validated_data = self._validate_run_input(run_data)

            # Create run
            run = self._run_repository.create(**validated_data)

            return run

        except Exception as e:
            self._handle_error(e, "create_run")

    def start_run(self, run_id: UUID) -> Optional[Run]:
        """Start a pending run."""
        try:
            run = self._run_repository.get_by_id(run_id)
            if not run:
                raise ValueError(f"Run with ID {run_id} not found")

            if run.status != "pending":
                raise ValueError(f"Cannot start run with status: {run.status}")

            # Check if thread is active
            thread = self._thread_repository.get_by_id(run.thread_id)
            if not thread or thread.archived:
                raise ValueError("Cannot start run for archived or non-existent thread")

            return self._run_repository.start_run(run_id)

        except Exception as e:
            self._handle_error(e, "start_run")

    def complete_run(
        self,
        run_id: UUID,
        output_data: Dict[str, Any],
        status: str = "completed",
        cpu_time: Optional[float] = None,
        memory_usage: Optional[float] = None
    ) -> Optional[Run]:
        """Complete a running run with output data."""
        try:
            run = self._run_repository.get_by_id(run_id)
            if not run:
                raise ValueError(f"Run with ID {run_id} not found")

            if not run.is_running:
                raise ValueError(f"Cannot complete run with status: {run.status}")

            # Validate output data
            if not isinstance(output_data, dict):
                raise ValueError("output_data must be a dictionary")

            # Validate status
            valid_completion_statuses = ["completed", "failed"]
            if status not in valid_completion_statuses:
                raise ValueError(f"Completion status must be one of: {valid_completion_statuses}")

            return self._run_repository.complete_run(
                run_id=run_id,
                status=status,
                output_data=output_data,
                cpu_time=cpu_time,
                memory_usage=memory_usage
            )

        except Exception as e:
            self._handle_error(e, "complete_run")

    def cancel_run(self, run_id: UUID) -> Optional[Run]:
        """Cancel a running or pending run."""
        try:
            run = self._run_repository.get_by_id(run_id)
            if not run:
                raise ValueError(f"Run with ID {run_id} not found")

            if run.is_completed:
                raise ValueError(f"Cannot cancel completed run with status: {run.status}")

            return self._run_repository.cancel_run(run_id)

        except Exception as e:
            self._handle_error(e, "cancel_run")

    def update_run_progress(self, run_id: UUID, progress: float) -> Optional[Run]:
        """Update run progress percentage."""
        try:
            if not (0.0 <= progress <= 100.0):
                raise ValueError("Progress must be between 0.0 and 100.0")

            run = self._run_repository.get_by_id(run_id)
            if not run:
                raise ValueError(f"Run with ID {run_id} not found")

            if not run.is_running:
                raise ValueError(f"Cannot update progress for run with status: {run.status}")

            return self._run_repository.update_progress(run_id, progress)

        except Exception as e:
            self._handle_error(e, "update_run_progress")

    def get_run(self, run_id: UUID) -> Optional[Run]:
        """Get a run by ID."""
        try:
            return self._run_repository.get_by_id(run_id)
        except Exception as e:
            self._handle_error(e, "get_run")

    def get_thread_runs(
        self, 
        thread_id: UUID, 
        skip: int = 0, 
        limit: int = 100,
        status_filter: Optional[str] = None
    ) -> List[Run]:
        """Get all runs for a thread."""
        try:
            # Validate thread exists
            thread = self._thread_repository.get_by_id(thread_id)
            if not thread:
                raise ValueError(f"Thread with ID {thread_id} not found")

            if status_filter:
                # Get runs by status for this thread
                all_runs = self._run_repository.get_runs_by_status(status_filter)
                thread_runs = [r for r in all_runs if r.thread_id == thread_id]
                return thread_runs[skip:skip + limit]
            else:
                return self._run_repository.get_by_thread_id(thread_id, skip=skip, limit=limit)

        except Exception as e:
            self._handle_error(e, "get_thread_runs")

    def get_active_runs(self, skip: int = 0, limit: int = 100) -> List[Run]:
        """Get all active (running or pending) runs."""
        try:
            return self._run_repository.get_active_runs(skip=skip, limit=limit)
        except Exception as e:
            self._handle_error(e, "get_active_runs")

    def get_child_runs(self, parent_run_id: UUID) -> List[Run]:
        """Get all child runs for a parent run."""
        try:
            # Validate parent run exists
            parent_run = self._run_repository.get_by_id(parent_run_id)
            if not parent_run:
                raise ValueError(f"Parent run with ID {parent_run_id} not found")

            return self._run_repository.get_by_parent_run_id(parent_run_id)

        except Exception as e:
            self._handle_error(e, "get_child_runs")

    def get_run_statistics(self, thread_id: Optional[UUID] = None) -> Dict[str, Any]:
        """Get run statistics, optionally filtered by thread."""
        try:
            if thread_id:
                # Validate thread exists
                thread = self._thread_repository.get_by_id(thread_id)
                if not thread:
                    raise ValueError(f"Thread with ID {thread_id} not found")

            return self._run_repository.get_run_statistics(thread_id)

        except Exception as e:
            self._handle_error(e, "get_run_statistics")

    def create_child_run(
        self,
        parent_run_id: UUID,
        input_data: Dict[str, Any],
        run_name: Optional[str] = None,
        run_type: str = "sub_execution",
        config: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ) -> Run:
        """Create a child run for an existing parent run."""
        try:
            # Get parent run
            parent_run = self._run_repository.get_by_id(parent_run_id)
            if not parent_run:
                raise ValueError(f"Parent run with ID {parent_run_id} not found")

            # Create child run in the same thread
            return self.create_run(
                thread_id=parent_run.thread_id,
                input_data=input_data,
                run_name=run_name or f"Child of {parent_run.run_name}",
                run_type=run_type,
                config=config,
                metadata=metadata,
                parent_run_id=parent_run_id
            )

        except Exception as e:
            self._handle_error(e, "create_child_run")

    def get_run_with_details(self, run_id: UUID) -> Optional[Dict[str, Any]]:
        """Get run with additional details including thread info and child runs."""
        try:
            run = self._run_repository.get_by_id(run_id)
            if not run:
                return None

            # Get thread info
            thread = self._thread_repository.get_by_id(run.thread_id)
            
            # Get child runs
            child_runs = self._run_repository.get_by_parent_run_id(run_id)

            # Get parent run if exists
            parent_run = None
            if run.parent_run_id:
                parent_run = self._run_repository.get_by_id(run.parent_run_id)

            return {
                "run": run,
                "thread": {
                    "thread_id": thread.thread_id if thread else None,
                    "name": thread.name if thread else None,
                    "status": thread.status if thread else None
                },
                "parent_run": {
                    "run_id": parent_run.run_id if parent_run else None,
                    "run_name": parent_run.run_name if parent_run else None
                } if parent_run else None,
                "child_runs": [
                    {
                        "run_id": child.run_id,
                        "run_name": child.run_name,
                        "status": child.status,
                        "created_at": child.created_at
                    }
                    for child in child_runs
                ],
                "duration": run.duration,
                "is_running": run.is_running,
                "is_completed": run.is_completed
            }

        except Exception as e:
            self._handle_error(e, "get_run_with_details")

    def _validate_run_input(self, data: Dict) -> Dict:
        """Validate run input data."""
        # Validate required fields
        if not data.get("thread_id"):
            raise ValueError("thread_id is required")

        if not data.get("input_data"):
            raise ValueError("input_data is required")

        # Validate run type
        valid_run_types = ["execution", "test", "debug", "sub_execution", "analysis"]
        if data.get("run_type") and data["run_type"] not in valid_run_types:
            raise ValueError(f"run_type must be one of: {valid_run_types}")

        # Validate status
        valid_statuses = ["pending", "running", "completed", "failed", "cancelled"]
        if data.get("status") and data["status"] not in valid_statuses:
            raise ValueError(f"status must be one of: {valid_statuses}")

        # Ensure JSON fields are dictionaries
        json_fields = ["input_data", "config", "run_metadata"]
        for field in json_fields:
            if data.get(field) is not None and not isinstance(data[field], dict):
                raise ValueError(f"{field} must be a dictionary")

        return data

    def _handle_error(self, error: Exception, operation: str) -> None:
        """Handle service errors."""
        # Log error (you might want to add proper logging here)
        print(f"RunService error in {operation}: {str(error)}")
        raise error