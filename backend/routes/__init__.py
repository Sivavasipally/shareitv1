"""
Routes package initialization
"""

from .users import router as users_router
from .books import router as books_router
from .boardgames import router as boardgames_router
from .requests import router as requests_router
from .admin import router as admin_router
from .activity import router as activity_router
from .notifications import router as notifications_router
from .search import router as search_router

__all__ = [
    'users_router',
    'books_router',
    'boardgames_router',
    'requests_router',
    'admin_router',
    'activity_router',
    'notifications_router',
    'search_router'
]