from datetime import datetime
from typing import Dict

from fastapi import HTTPException

from src.storage.models.thread import Thread
from src.storage.repositories.thread_repository import ThreadRepository


class ThreadService:
    """Service for Thread business logic operations (async)."""

    def __init__(self, thread_repository: ThreadRepository):
        """Initialize the ThreadService."""
        self.thread_repository = thread_repository

    async def create_thread(
        self,
        user_id: str,
        name: str | None = None,
        description: str | None = None,
        initial_config: Dict | None = None,
        initial_values: Dict | None = None,
        session_id: str | None = None,
        metadata: Dict | None = None,
    ) -> Thread:
        """Create a new thread for a user (async)."""
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

        # Create thread (async)
        thread = await self.thread_repository.create(Thread(**thread_data))
        return thread

    async def get_thread(self, thread_id: str) -> Thread:
        """Get a thread by id (async)."""
        result = await self.thread_repository.get(thread_id)

        if result is None:
            raise HTTPException(status_code=404, detail="Thread not found")

        return result

    async def update_thread(self, thread_id: str, values: dict) -> Thread:
        """Update a thread by id (async)."""
        thread = await self.get_thread(thread_id)
        thread.values = values
        return await self.thread_repository.update(thread)
