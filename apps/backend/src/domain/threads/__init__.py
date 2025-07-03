from typing import Annotated

from pydantic import BaseModel, Field


class QuerySingleThread(BaseModel):
    """Query a single thread by ID."""

    thread_id: Annotated[
        str,
        Field(
            description="The ID of the thread to query", min_length=32, max_length=36
        ),
    ]
