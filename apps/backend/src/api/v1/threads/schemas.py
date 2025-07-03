from typing import Dict

from pydantic import BaseModel


class CreateThreadRequest(BaseModel):
    """Create a new thread request."""

    name: str | None = None
    description: str | None = None
    initial_config: Dict | None = None
    initial_values: Dict | None = None
    session_id: str | None = None
    metadata: Dict | None = None


class RunThreadRequest(BaseModel):
    """Run a thread request."""

    input: str
