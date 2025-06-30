import json
from typing import Any, Dict

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.core.middleware import get_current_user
from src.core.settings import get_settings
from src.lg.graph import graph

app = FastAPI(redirect_slashes=False)

settings = get_settings()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


class ChatRequest(BaseModel):
    """Chat request."""

    input: Dict[str, Any]


async def handle_graph_stream(input: dict):
    """Handle the graph stream."""
    async for event, msg_tuple in graph.astream(input=input, stream_mode=["messages"]):
        yield f"event: {event}\n" + f"data: {json.dumps(msg_tuple[0].model_dump())}\n\n"


@app.post("/api/v1/chat")
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    """Chat endpoint."""
    # Add user context to the input
    input_with_user = {
        **request.input,
        "user_id": user["user_id"],
        "user_email": user["email"],
    }

    print(user)

    return StreamingResponse(
        handle_graph_stream(input=input_with_user),
        media_type="text/event-stream",
    )
