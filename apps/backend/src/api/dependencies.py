from typing import Annotated, Any, Dict

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.core.auth import auth_service
from src.services.run_service import RunService
from src.services.thread_service import ThreadService
from src.storage.db import sessionmanager
from src.storage.repositories.run import RunRepository
from src.storage.repositories.thread_repository import ThreadRepository


def get_thread_repository() -> ThreadRepository:
    """Get the thread repository."""
    return ThreadRepository(sessionmanager)


def get_thread_service(
    repository: ThreadRepository = Depends(get_thread_repository),
) -> ThreadService:
    """Get the thread service."""
    return ThreadService(repository)


def get_run_repository() -> RunRepository:
    """Get the run repository."""
    return RunRepository(sessionmanager)


def get_run_service(
    repository: RunRepository = Depends(get_run_repository),
    thread_service: ThreadService = Depends(get_thread_service),
) -> RunService:
    """Get the run service."""
    return RunService(repository, thread_service)


# Create HTTP Bearer security scheme
bearer_scheme = HTTPBearer(auto_error=False)


async def verify_auth_token(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> Dict[str, Any]:
    """Verify the Authorization header and return claims.

    For now, this function validates the Bearer token format but doesn't decode JWT.
    It returns mock claims that endpoints can use.

    Args:
        credentials: HTTP Bearer credentials from Authorization header

    Returns:
        Dict containing the token claims

    Raises:
        HTTPException: If Authorization header is missing or invalid format
    """
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not credentials.credentials:
        raise HTTPException(
            status_code=401,
            detail="Bearer token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_data = await auth_service.verify_token(credentials.credentials)

    return user_data
