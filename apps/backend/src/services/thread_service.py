from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.models.thread import Thread
from src.repositories.thread import ThreadRepository
from .base import BaseService


class ThreadService(BaseService):
    """Service for Thread business logic operations."""

    def __init__(self, db: Session):
        super().__init__(db)
        self._repository = ThreadRepository(db)

    def _get_repository(self) -> ThreadRepository:
        """Get the ThreadRepository instance."""
        return self._repository

    def create_thread(
        self,
        user_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        initial_config: Optional[Dict] = None,
        initial_values: Optional[Dict] = None,
        session_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> Thread:
        """Create a new thread for a user."""
        try:
            # Validate user_id
            if not user_id or not user_id.strip():
                raise ValueError("user_id is required and cannot be empty")

            # Set default name if not provided
            if not name:
                name = f"Thread {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"

            # Prepare thread data
            thread_data = {
                "user_id": user_id.strip(),
                "name": name,
                "description": description,
                "config": initial_config or {},
                "values": initial_values or {},
                "thread_metadata": metadata or {},
                "session_id": session_id,
                "status": "active",
            }

            # Validate input
            validated_data = self._validate_thread_input(thread_data)

            # Create thread
            thread = self._repository.create(**validated_data)

            return thread

        except Exception as e:
            self._handle_error(e, "create_thread")

    def get_thread(self, thread_id: UUID) -> Optional[Thread]:
        """Get a thread by ID."""
        try:
            return self._repository.get_by_id(thread_id)
        except Exception as e:
            self._handle_error(e, "get_thread")

    def get_user_threads(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        include_archived: bool = False,
    ) -> List[Thread]:
        """Get all threads for a user."""
        try:
            if not user_id or not user_id.strip():
                raise ValueError("user_id is required and cannot be empty")

            if include_archived:
                # Get all threads including archived ones
                return self._repository.get_all(skip=skip, limit=limit)
            else:
                return self._repository.get_by_user_id(
                    user_id.strip(), skip=skip, limit=limit
                )

        except Exception as e:
            self._handle_error(e, "get_user_threads")

    def update_thread(
        self,
        thread_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        config: Optional[Dict] = None,
        values: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
        status: Optional[str] = None,
    ) -> Optional[Thread]:
        """Update thread information."""
        try:
            # Get existing thread
            thread = self._repository.get_by_id(thread_id)
            if not thread:
                return None

            # Prepare update data
            update_data = {}
            if name is not None:
                update_data["name"] = name
            if description is not None:
                update_data["description"] = description
            if config is not None:
                update_data["config"] = config
            if values is not None:
                update_data["values"] = values
            if metadata is not None:
                update_data["thread_metadata"] = metadata
            if status is not None:
                update_data["status"] = status

            # Update timestamp
            update_data["updated_at"] = datetime.utcnow()

            # Validate and update
            if update_data:
                validated_data = self._validate_thread_update(update_data)
                return self._repository.update(thread_id, **validated_data)

            return thread

        except Exception as e:
            self._handle_error(e, "update_thread")

    def update_thread_values(self, thread_id: UUID, values: Dict) -> Optional[Thread]:
        """Update thread state/values."""
        try:
            if not isinstance(values, dict):
                raise ValueError("values must be a dictionary")

            return self._repository.update_values(thread_id, values)

        except Exception as e:
            self._handle_error(e, "update_thread_values")

    def archive_thread(self, thread_id: UUID) -> Optional[Thread]:
        """Archive a thread (soft delete)."""
        try:
            return self._repository.archive_thread(thread_id)
        except Exception as e:
            self._handle_error(e, "archive_thread")

    def activate_thread(self, thread_id: UUID) -> Optional[Thread]:
        """Activate an archived thread."""
        try:
            thread = self._repository.get_by_id(thread_id)
            if not thread:
                return None

            return self._repository.update(
                thread_id, status="active", archived=False, updated_at=datetime.utcnow()
            )

        except Exception as e:
            self._handle_error(e, "activate_thread")

    def search_threads(
        self, user_id: str, name_pattern: str, skip: int = 0, limit: int = 100
    ) -> List[Thread]:
        """Search user's threads by name pattern."""
        try:
            if not user_id or not user_id.strip():
                raise ValueError("user_id is required and cannot be empty")

            # Get all matching threads and filter by user
            all_matching = self._repository.search_by_name(
                name_pattern, skip=0, limit=1000
            )
            user_threads = [t for t in all_matching if t.user_id == user_id.strip()]

            # Apply pagination
            return user_threads[skip : skip + limit]

        except Exception as e:
            self._handle_error(e, "search_threads")

    def get_thread_summary(self, thread_id: UUID) -> Optional[Dict]:
        """Get a summary of thread information including run statistics."""
        try:
            thread = self._repository.get_by_id(thread_id)
            if not thread:
                return None

            # Get run count (assuming we have access to run repository)
            from src.repositories.run import RunRepository

            run_repo = RunRepository(self.db)
            runs = run_repo.get_by_thread_id(thread_id)

            return {
                "thread_id": thread.thread_id,
                "name": thread.name,
                "description": thread.description,
                "status": thread.status,
                "created_at": thread.created_at,
                "updated_at": thread.updated_at,
                "user_id": thread.user_id,
                "run_count": len(runs),
                "active_runs": len([r for r in runs if r.is_running]),
                "completed_runs": len([r for r in runs if r.status == "completed"]),
                "archived": thread.archived,
            }

        except Exception as e:
            self._handle_error(e, "get_thread_summary")

    def _validate_thread_input(self, data: Dict) -> Dict:
        """Validate thread input data."""
        # Validate required fields
        if not data.get("user_id"):
            raise ValueError("user_id is required")

        # Validate status
        valid_statuses = ["active", "paused", "completed", "error"]
        if data.get("status") and data["status"] not in valid_statuses:
            raise ValueError(f"status must be one of: {valid_statuses}")

        # Ensure config and values are dictionaries
        if data.get("config") is not None and not isinstance(data["config"], dict):
            raise ValueError("config must be a dictionary")

        if data.get("values") is not None and not isinstance(data["values"], dict):
            raise ValueError("values must be a dictionary")

        if data.get("thread_metadata") is not None and not isinstance(
            data["thread_metadata"], dict
        ):
            raise ValueError("thread_metadata must be a dictionary")

        return data

    def _validate_thread_update(self, data: Dict) -> Dict:
        """Validate thread update data."""
        # Validate status
        valid_statuses = ["active", "paused", "completed", "error"]
        if data.get("status") and data["status"] not in valid_statuses:
            raise ValueError(f"status must be one of: {valid_statuses}")

        # Ensure JSON fields are dictionaries
        json_fields = ["config", "values", "thread_metadata"]
        for field in json_fields:
            if data.get(field) is not None and not isinstance(data[field], dict):
                raise ValueError(f"{field} must be a dictionary")

        return data

    def _handle_error(self, error: Exception, operation: str) -> None:
        """Handle service errors."""
        # Log error (you might want to add proper logging here)
        print(f"ThreadService error in {operation}: {str(error)}")
        raise error
