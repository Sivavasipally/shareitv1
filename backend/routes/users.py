from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import json
from datetime import datetime

from auth import AuthService
from database import execute_query, execute_one
from utils.jwt_handler import get_current_user
from utils.validators import validate_email, validate_phone

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# Pydantic models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    flat_number: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_contact: Optional[str] = "email"
    contact_times: Optional[List[str]] = []
    interests: Optional[List[str]] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    flat_number: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_contact: Optional[str] = None
    contact_times: Optional[List[str]] = None
    interests: Optional[List[str]] = None


class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str


# Auth endpoints
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    """Register a new user"""
    # Validate email format
    if not validate_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Validate phone if provided
    if user.phone_number and not validate_phone(user.phone_number):
        raise HTTPException(status_code=400, detail="Invalid phone number format")

    result, error = AuthService.register_user(
        user.username, user.email, user.password,
        full_name=user.full_name,
        flat_number=user.flat_number,
        phone_number=user.phone_number,
        preferred_contact=user.preferred_contact,
        contact_times=json.dumps(user.contact_times),
        interests=json.dumps(user.interests)
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {"success": True, "data": result}


@router.post("/login")
async def login(user: UserLogin):
    """Login user"""
    result, error = AuthService.login_user(user.email, user.password)

    if error:
        raise HTTPException(status_code=401, detail=error)

    return {"success": True, "data": result}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {"success": True, "data": {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "flat_number": current_user["flat_number"],
        "phone_number": current_user["phone_number"],
        "preferred_contact": current_user["preferred_contact"],
        "contact_times": json.loads(current_user["contact_times"]) if current_user["contact_times"] else [],
        "interests": json.loads(current_user["interests"]) if current_user["interests"] else [],
        "is_admin": current_user["is_admin"]
    }}


@router.put("/profile")
async def update_profile(
        updates: UserUpdate,
        current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    update_fields = []
    params = []

    if updates.full_name is not None:
        update_fields.append("full_name = %s")
        params.append(updates.full_name)

    if updates.flat_number is not None:
        update_fields.append("flat_number = %s")
        params.append(updates.flat_number)

    if updates.phone_number is not None:
        if updates.phone_number and not validate_phone(updates.phone_number):
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        update_fields.append("phone_number = %s")
        params.append(updates.phone_number)

    if updates.preferred_contact is not None:
        if updates.preferred_contact not in ['email', 'phone', 'both']:
            raise HTTPException(status_code=400, detail="Invalid preferred contact method")
        update_fields.append("preferred_contact = %s")
        params.append(updates.preferred_contact)

    if updates.contact_times is not None:
        update_fields.append("contact_times = %s")
        params.append(json.dumps(updates.contact_times))

    if updates.interests is not None:
        update_fields.append("interests = %s")
        params.append(json.dumps(updates.interests))

    if update_fields:
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(current_user["id"])
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params)

        # Log activity
        execute_query(
            """INSERT INTO activity_log (user_id, action, item_type)
               VALUES (%s, %s, %s)""",
            (current_user['id'], 'profile_updated', 'user')
        )

    return {"success": True, "message": "Profile updated successfully"}


@router.put("/password")
async def update_password(
        password_data: PasswordUpdate,
        current_user: dict = Depends(get_current_user)
):
    """Update user password"""
    success, message = AuthService.update_password(
        current_user['id'],
        password_data.old_password,
        password_data.new_password
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {"success": True, "message": message}


@router.get("/users/{user_id}")
async def get_user(
        user_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Get user by ID (limited info for non-admins)"""
    user = execute_one(
        """SELECT id, username, full_name, created_at 
           FROM users WHERE id = %s AND is_active = TRUE""",
        (user_id,)
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # If requesting own profile or admin, return more details
    if user_id == current_user['id'] or current_user['is_admin']:
        user = execute_one(
            """SELECT id, username, email, full_name, flat_number,
                      phone_number, preferred_contact, contact_times,
                      interests, created_at
               FROM users WHERE id = %s""",
            (user_id,)
        )

        if user['contact_times']:
            user['contact_times'] = json.loads(user['contact_times'])
        if user['interests']:
            user['interests'] = json.loads(user['interests'])

    return {"success": True, "data": user}


@router.delete("/account")
async def delete_account(
        current_user: dict = Depends(get_current_user)
):
    """Soft delete user account"""
    # Don't allow admin to delete their own account if they're the only admin
    if current_user['is_admin']:
        admin_count = execute_one("SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE")
        if admin_count['count'] <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the only admin account"
            )

    # Soft delete by setting is_active to FALSE
    execute_query(
        "UPDATE users SET is_active = FALSE WHERE id = %s",
        (current_user['id'],)
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type)
           VALUES (%s, %s, %s)""",
        (current_user['id'], 'account_deleted', 'user')
    )

    return {"success": True, "message": "Account deleted successfully"}