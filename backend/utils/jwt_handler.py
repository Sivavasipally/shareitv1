from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import os

from auth import AuthService
from database import execute_one

# Security scheme
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to get the current authenticated user.

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        dict: User information from database

    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials

    # Verify token
    payload = AuthService.verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = execute_one(
        "SELECT * FROM users WHERE id = %s",
        (payload['user_id'],)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user['is_active']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    return user


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to require admin privileges.

    Args:
        current_user: Current authenticated user

    Returns:
        dict: Admin user information

    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.get('is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    return current_user


def create_access_token(user_id: int) -> str:
    """
    Create a new access token for a user.

    Args:
        user_id: ID of the user

    Returns:
        str: JWT token
    """
    return AuthService.generate_token(user_id)


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token string

    Returns:
        dict: Token payload if valid, None otherwise
    """
    return AuthService.verify_token(token)


class TokenData:
    """
    Token data model for type hints
    """

    def __init__(self, user_id: int):
        self.user_id = user_id