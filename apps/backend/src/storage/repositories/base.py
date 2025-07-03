from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, List, Optional, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

# Generic type for model classes
ModelType = TypeVar("ModelType")


class BaseRepository(ABC, Generic[ModelType]):
    """Abstract base repository providing common CRUD operations."""

    def __init__(self, db: Session, model_class: type[ModelType]):
        self.db = db
        self.model_class = model_class

    @abstractmethod
    def create(self, **kwargs) -> ModelType:
        """Create a new entity."""
        pass

    @abstractmethod
    def get_by_id(self, entity_id: UUID) -> Optional[ModelType]:
        """Get entity by ID."""
        pass

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all entities with pagination."""
        return self.db.query(self.model_class).offset(skip).limit(limit).all()

    def update(self, entity_id: UUID, **kwargs) -> Optional[ModelType]:
        """Update entity by ID."""
        entity = self.get_by_id(entity_id)
        if entity:
            for key, value in kwargs.items():
                if hasattr(entity, key):
                    setattr(entity, key, value)
            self.db.commit()
            self.db.refresh(entity)
        return entity

    def delete(self, entity_id: UUID) -> bool:
        """Delete entity by ID."""
        entity = self.get_by_id(entity_id)
        if entity:
            self.db.delete(entity)
            self.db.commit()
            return True
        return False

    def count(self) -> int:
        """Count total entities."""
        return self.db.query(self.model_class).count()

    def exists(self, entity_id: UUID) -> bool:
        """Check if entity exists."""
        return (
            self.db.query(self.model_class)
            .filter(getattr(self.model_class, self._get_id_column()) == entity_id)
            .first()
            is not None
        )

    @abstractmethod
    def _get_id_column(self) -> str:
        """Get the name of the ID column for this model."""
        pass
