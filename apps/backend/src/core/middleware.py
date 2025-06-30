from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from src.core.auth import auth_service


class AuthMiddleware:
    """Authentication middleware for protected routes."""

    def __init__(self):
        self.auth_service = auth_service

    async def __call__(self, request: Request):
        """Verify authentication and add user data to request state."""
        try:
            user_data = await self.auth_service.verify_session(request)
            request.state.user = user_data
            return user_data
        except HTTPException:
            raise


# Dependency for protected routes
async def get_current_user(request: Request) -> dict:
    """Get current authenticated user from request.

    Args:
        request: FastAPI request object

    Returns:
        Dict containing user_id and email

    Raises:
        HTTPException: If not authenticated
    """
    try:
        user_data = await auth_service.verify_session(request)
        return user_data
    except HTTPException:
        raise


# Optional authentication dependency
async def get_current_user_optional(request: Request) -> dict | None:
    """Get current authenticated user from request (optional).

    Args:
        request: FastAPI request object

    Returns:
        Dict containing user_id and email, or None if not authenticated
    """
    try:
        user_data = await auth_service.verify_session(request)
        return user_data
    except HTTPException:
        return None
