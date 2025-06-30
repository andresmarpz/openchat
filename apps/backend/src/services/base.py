from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type
from uuid import UUID

from sqlalchemy.orm import Session

from src.repositories.base import BaseRepository


class BaseService(ABC):
    """Abstract base service for business logic operations."""

    def __init__(self, db: Session):
        self.db = db

    @abstractmethod
    def _get_repository(self) -> BaseRepository:
        """Get the repository instance for this service."""
        pass

    def _validate_input(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate input data. Override in subclasses for custom validation."""
        return data

    def _handle_error(self, error: Exception, operation: str) -> None:
        """Handle service errors. Override in subclasses for custom error handling."""
        raise error
