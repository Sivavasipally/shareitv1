"""
Pydantic models for Share-IT backend
These models can be used for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


# Enums
class ContactPreference(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    BOTH = "both"


class Complexity(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    RETURNED = "returned"


class ItemType(str, Enum):
    BOOK = "book"
    BOARDGAME = "boardgame"


# Base Models
class BaseResponse(BaseModel):
    """Base response model"""
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None


class PaginatedResponse(BaseResponse):
    """Paginated response model"""
    total: int
    limit: int
    offset: int


# User Models
class UserBase(BaseModel):
    """Base user model"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)
    flat_number: Optional[str] = Field(None, max_length=20)
    phone_number: Optional[str] = Field(None, max_length=20)
    preferred_contact: Optional[ContactPreference] = ContactPreference.EMAIL
    contact_times: Optional[List[str]] = []
    interests: Optional[List[str]] = []


class UserCreate(UserBase):
    """User registration model"""
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    """User update model"""
    full_name: Optional[str] = Field(None, max_length=100)
    flat_number: Optional[str] = Field(None, max_length=20)
    phone_number: Optional[str] = Field(None, max_length=20)
    preferred_contact: Optional[ContactPreference] = None
    contact_times: Optional[List[str]] = None
    interests: Optional[List[str]] = None


class UserInDB(UserBase):
    """User database model"""
    id: int
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None


class UserResponse(UserInDB):
    """User response model"""
    pass


class LoginRequest(BaseModel):
    """Login request model"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response model"""
    user_id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_admin: bool
    token: str


class PasswordUpdate(BaseModel):
    """Password update model"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


# Book Models
class BookBase(BaseModel):
    """Base book model"""
    title: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1, max_length=100)
    isbn: Optional[str] = Field(None, max_length=20)
    genre: Optional[str] = Field(None, max_length=50)
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    language: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=2000)
    cover_url: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = []


class BookCreate(BookBase):
    """Book creation model"""
    pass


class BookUpdate(BaseModel):
    """Book update model"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    isbn: Optional[str] = Field(None, max_length=20)
    genre: Optional[str] = Field(None, max_length=50)
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    language: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=2000)
    cover_url: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    is_available: Optional[bool] = None


class BookInDB(BookBase):
    """Book database model"""
    id: int
    owner_id: int
    owner_name: Optional[str] = None
    is_available: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None


class BookResponse(BookInDB):
    """Book response model"""
    owner_email: Optional[str] = None
    owner_phone: Optional[str] = None
    preferred_contact: Optional[str] = None


# Board Game Models
class BoardGameBase(BaseModel):
    """Base board game model"""
    title: str = Field(..., min_length=1, max_length=200)
    designer: Optional[str] = Field(None, max_length=100)
    min_players: Optional[int] = Field(None, ge=1, le=20)
    max_players: Optional[int] = Field(None, ge=1, le=20)
    play_time: Optional[str] = Field(None, max_length=50)
    complexity: Optional[Complexity] = None
    description: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=500)
    categories: Optional[List[str]] = []
    components: Optional[List[str]] = []

    @field_validator('max_players')
    def validate_players(cls, v, values):
        """Validate that max_players >= min_players"""
        if 'min_players' in values.data and v is not None and values.data['min_players'] is not None:
            if v < values.data['min_players']:
                raise ValueError('max_players must be greater than or equal to min_players')
        return v


class BoardGameCreate(BoardGameBase):
    """Board game creation model"""
    pass


class BoardGameUpdate(BaseModel):
    """Board game update model"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    designer: Optional[str] = Field(None, max_length=100)
    min_players: Optional[int] = Field(None, ge=1, le=20)
    max_players: Optional[int] = Field(None, ge=1, le=20)
    play_time: Optional[str] = Field(None, max_length=50)
    complexity: Optional[Complexity] = None
    description: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=500)
    categories: Optional[List[str]] = None
    components: Optional[List[str]] = None
    is_available: Optional[bool] = None


class BoardGameInDB(BoardGameBase):
    """Board game database model"""
    id: int
    owner_id: int
    owner_name: Optional[str] = None
    is_available: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None


class BoardGameResponse(BoardGameInDB):
    """Board game response model"""
    owner_email: Optional[str] = None
    owner_phone: Optional[str] = None
    preferred_contact: Optional[str] = None


# Request Models
class RequestBase(BaseModel):
    """Base request model"""
    item_type: ItemType
    item_id: int = Field(..., gt=0)
    pickup_date: date
    return_date: date
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator('return_date')
    def validate_dates(cls, v, values):
        """Validate that return_date > pickup_date"""
        if 'pickup_date' in values.data and v <= values.data['pickup_date']:
            raise ValueError('return_date must be after pickup_date')
        return v


class RequestCreate(RequestBase):
    """Request creation model"""
    pass


class RequestUpdate(BaseModel):
    """Request update model"""
    pickup_date: Optional[date] = None
    return_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=500)


class RequestInDB(RequestBase):
    """Request database model"""
    id: int
    requester_id: int
    owner_id: int
    status: RequestStatus = RequestStatus.PENDING
    request_date: datetime
    response_date: Optional[datetime] = None


class RequestResponse(RequestInDB):
    """Request response model"""
    requester_name: str
    requester_email: Optional[str] = None
    requester_phone: Optional[str] = None
    owner_name: str
    owner_email: Optional[str] = None
    owner_phone: Optional[str] = None
    item_title: str
    item_creator: Optional[str] = None
    item_description: Optional[str] = None
    item_image: Optional[str] = None
    is_owner: bool
    is_requester: bool


# Notification Models
class NotificationBase(BaseModel):
    """Base notification model"""
    title: str = Field(..., max_length=200)
    message: str
    type: str = Field("info", pattern="^(info|success|warning|error)$")


class NotificationInDB(NotificationBase):
    """Notification database model"""
    id: int
    user_id: int
    is_read: bool = False
    created_at: datetime


# Activity Log Models
class ActivityLog(BaseModel):
    """Activity log model"""
    id: int
    user_id: int
    username: Optional[str] = None
    action: str
    item_type: Optional[str] = None
    item_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime


# Admin Models
class UserAdminUpdate(BaseModel):
    """Admin user update model"""
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class AdminStats(BaseModel):
    """Admin statistics model"""
    users: Dict[str, int]
    books: Dict[str, int]
    boardgames: Dict[str, int]
    requests: Dict[str, int]
    recent_activities: List[ActivityLog]
    top_users: Dict[str, List[Dict[str, Any]]]


# Community Models (for future use)
class CommunityBase(BaseModel):
    """Base community model"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=200)


class CommunityCreate(CommunityBase):
    """Community creation model"""
    pass


class CommunityInDB(CommunityBase):
    """Community database model"""
    id: int
    created_by: int
    created_at: datetime


# Error Models
class ErrorResponse(BaseModel):
    """Error response model"""
    detail: str
    status_code: Optional[int] = None
    error_type: Optional[str] = None