from fastapi import APIRouter, Depends, Query
import json

from database import execute_query
from utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search")
async def search_items(
        q: str = Query(..., min_length=1, description="Search query"),
        limit: int = Query(20, ge=1, le=50),
        current_user: dict = Depends(get_current_user)
):
    """Search across books and board games"""
    search_term = f"%{q}%"

    # Search books
    books_query = """
        SELECT b.id, b.title, b.author, b.is_available, u.username as owner_name
        FROM books b
        JOIN users u ON b.owner_id = u.id
        WHERE (b.title LIKE %s OR b.author LIKE %s OR b.description LIKE %s)
        ORDER BY b.created_at DESC
        LIMIT %s
    """
    books = execute_query(
        books_query,
        (search_term, search_term, search_term, limit),
        fetch=True
    )

    # Search board games
    boardgames_query = """
        SELECT bg.id, bg.title, bg.designer, bg.is_available, u.username as owner_name
        FROM board_games bg
        JOIN users u ON bg.owner_id = u.id
        WHERE (bg.title LIKE %s OR bg.designer LIKE %s OR bg.description LIKE %s)
        ORDER BY bg.created_at DESC
        LIMIT %s
    """
    boardgames = execute_query(
        boardgames_query,
        (search_term, search_term, search_term, limit),
        fetch=True
    )

    return {
        "success": True,
        "data": {
            "books": books,
            "boardgames": boardgames,
            "query": q,
            "total_results": len(books) + len(boardgames)
        }
    }