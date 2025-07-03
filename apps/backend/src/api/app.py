import logging
from typing import Any, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.api.v1.threads.router import threads_router
from src.core.settings import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(redirect_slashes=True)

settings = get_settings()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(threads_router)


@app.get("/api/v1/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


class ChatRequest(BaseModel):
    """Chat request."""

    input: Dict[str, Any]
