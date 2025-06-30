from fastapi import HTTPException, Request
from supabase import Client, create_client

from src.core.settings import get_settings


class SupabaseAuthService:
    """Service for handling Supabase authentication verification."""

    def __init__(self):
        settings = get_settings()
        self.supabase: Client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
        )

    async def verify_session(self, request: Request) -> dict:
        """Verify session from request and return user data.

        Args:
            request: FastAPI request object

        Returns:
            Dict containing user_id and email

        Raises:
            HTTPException: If authentication fails
        """
        # Try to get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            return await self._verify_token(token)

        # Try to get token from cookies
        cookie_token = request.cookies.get("sb-access-token")
        if cookie_token:
            return await self._verify_token(cookie_token)

        # Try to get token from custom header
        custom_token = request.headers.get("X-Supabase-Token")
        if custom_token:
            return await self._verify_token(custom_token)

        raise HTTPException(
            status_code=401, detail="No valid authentication token found"
        )

    async def _verify_token(self, token: str) -> dict:
        """Verify a JWT token and return user data.

        Args:
            token: JWT token string

        Returns:
            Dict containing user_id and email

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            # Verify the token and get user info
            user_response = self.supabase.auth.get_user(token)

            if not user_response or not user_response.user:
                raise HTTPException(status_code=401, detail="Invalid or expired token")

            user = user_response.user
            return {"user_id": user.id, "email": user.email}

        except Exception as e:
            raise HTTPException(
                status_code=401, detail=f"Authentication failed: {str(e)}"
            )

    async def get_user_by_id(self, user_id: str) -> dict | None:
        """Get user data by user ID.

        Args:
            user_id: User ID string

        Returns:
            User data dict or None if not found
        """
        try:
            response = self.supabase.auth.admin.get_user_by_id(user_id)
            if response.user:
                return {
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "created_at": response.user.created_at,
                    "updated_at": response.user.updated_at,
                }
            return None
        except Exception:
            return None


# Global instance
auth_service = SupabaseAuthService()
