import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Path
from fastapi.responses import StreamingResponse

from src.api.dependencies import get_run_service, get_thread_service
from src.api.v1.threads.schemas import CreateThreadRequest, RunThreadRequest
from src.core.middleware import get_current_user
from src.services.run_service import RunService
from src.services.thread_service import ThreadService

logger = logging.getLogger(__name__)

threads_router = APIRouter(
    prefix="/threads",
    tags=["threads"],
)


@threads_router.post("/")
async def create_thread(
    request: CreateThreadRequest,
    service: ThreadService = Depends(get_thread_service),
    user: dict = Depends(get_current_user),
):
    """Create a new thread."""
    thread = await service.create_thread(
        user_id=user["user_id"],
        name=getattr(request, "name", None),
        description=getattr(request, "description", None),
        initial_config=getattr(request, "initial_config", None),
        initial_values=getattr(request, "initial_values", None),
        session_id=getattr(request, "session_id", None),
        metadata=getattr(request, "metadata", None),
    )
    return thread


@threads_router.post("/{thread_id}/run")
async def run_thread(
    thread_id: Annotated[str, Path(min_length=32, max_length=36)],
    request: RunThreadRequest,
    thread_service: ThreadService = Depends(get_thread_service),
    run_service: RunService = Depends(get_run_service),
):
    """Run a thread."""
    thread = await thread_service.get_thread(thread_id)

    new_run, stream = await run_service.create(
        thread,
        input_data={
            "messages": [
                {"role": "user", "content": request.input},
            ],
        },
    )

    return StreamingResponse(
        stream,
        media_type="text/event-stream",
    )
