from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from typing import Optional, List
import json

from database import execute_query, execute_one
from utils.jwt_handler import get_current_user
from utils.validators import validate_isbn, sanitize_html

# routes/books.py (Example)

router = APIRouter(prefix="/api/books", tags=["books"])


class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1, max_length=100)
    isbn: Optional[str] = Field(None, max_length=20)
    genre: Optional[str] = Field(None, max_length=50)
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    language: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=2000)
    cover_url: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = []


class BookUpdate(BaseModel):
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


@router.get("/")
async def get_books(
        search: Optional[str] = Query(None, description="Search in title or author"),
        genre: Optional[str] = Query(None, description="Filter by genre"),
        available: Optional[bool] = Query(None, description="Filter by availability"),
        owner_id: Optional[int] = Query(None, description="Filter by owner"),
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
        current_user: dict = Depends(get_current_user)
):
    """Get all books with filters"""
    query = """
        SELECT b.*, u.username as owner_name,
               CASE WHEN b.tags IS NOT NULL THEN b.tags ELSE '[]' END as tags,
               COUNT(*) OVER() as total_count
        FROM books b 
        JOIN users u ON b.owner_id = u.id 
        WHERE 1=1
    """
    params = []

    if search:
        query += " AND (b.title LIKE %s OR b.author LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    if genre:
        query += " AND b.genre = %s"
        params.append(genre)

    if available is not None:
        query += " AND b.is_available = %s"
        params.append(available)

    if owner_id:
        query += " AND b.owner_id = %s"
        params.append(owner_id)

    query += " ORDER BY b.created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    books = execute_query(query, params, fetch=True)

    if not books:
        return {"success": True, "data": [], "total": 0}

    total = books[0]['total_count'] if books else 0

    # Parse JSON fields and format dates
    for book in books:
        book['tags'] = json.loads(book['tags']) if book['tags'] else []
        book['created_at'] = book['created_at'].isoformat() if book['created_at'] else None
        book['updated_at'] = book['updated_at'].isoformat() if book['updated_at'] else None
        book.pop('total_count', None)

    return {
        "success": True,
        "data": books,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book( book: BookCreate, current_user: dict = Depends(get_current_user)):
    """Create a new book"""
    # Validate ISBN if provided
    if book.isbn and not validate_isbn(book.isbn):
        raise HTTPException(status_code=400, detail="Invalid ISBN format")

    # Sanitize description
    if book.description:
        book.description = sanitize_html(book.description)

    book_id = execute_query(
        """INSERT INTO books (title, author, isbn, genre, publication_year, 
           language, description, cover_url, owner_id, tags)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (book.title, book.author, book.isbn, book.genre, book.publication_year,
         book.language, book.description, book.cover_url, current_user['id'],
         json.dumps(book.tags))
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'added', 'book', book_id,
         json.dumps({"title": book.title, "author": book.author}))
    )

    # Create notification
    execute_query(
        """INSERT INTO notifications (user_id, title, message, type)
           VALUES (%s, %s, %s, %s)""",
        (current_user['id'], 'Book Added',
         f'You have successfully added "{book.title}"', 'success')
    )

    return {"success": True, "data": {"id": book_id, "message": "Book created successfully"}}


@router.get("/{book_id}")
async def get_book(
        book_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Get book by ID"""
    book = execute_one(
        """SELECT b.*, u.username as owner_name, u.email as owner_email,
                  u.phone_number as owner_phone, u.preferred_contact
           FROM books b 
           JOIN users u ON b.owner_id = u.id 
           WHERE b.id = %s""",
        (book_id,)
    )

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book['tags'] = json.loads(book['tags']) if book['tags'] else []
    book['created_at'] = book['created_at'].isoformat() if book['created_at'] else None
    book['updated_at'] = book['updated_at'].isoformat() if book['updated_at'] else None

    # Hide owner contact info if book is not available and user is not the owner
    if not book['is_available'] and book['owner_id'] != current_user['id']:
        book.pop('owner_email', None)
        book.pop('owner_phone', None)

    return {"success": True, "data": book}


@router.put("/{book_id}")
async def update_book(
        book_id: int,
        book_update: BookUpdate,
        current_user: dict = Depends(get_current_user)
):
    """Update book (owner only)"""
    # Check ownership
    book = execute_one("SELECT owner_id FROM books WHERE id = %s", (book_id,))
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book['owner_id'] != current_user['id'] and not current_user['is_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to update this book")

    # Build update query
    update_fields = []
    params = []

    if book_update.title is not None:
        update_fields.append("title = %s")
        params.append(book_update.title)

    if book_update.author is not None:
        update_fields.append("author = %s")
        params.append(book_update.author)

    if book_update.isbn is not None:
        if book_update.isbn and not validate_isbn(book_update.isbn):
            raise HTTPException(status_code=400, detail="Invalid ISBN format")
        update_fields.append("isbn = %s")
        params.append(book_update.isbn)

    if book_update.genre is not None:
        update_fields.append("genre = %s")
        params.append(book_update.genre)

    if book_update.publication_year is not None:
        update_fields.append("publication_year = %s")
        params.append(book_update.publication_year)

    if book_update.language is not None:
        update_fields.append("language = %s")
        params.append(book_update.language)

    if book_update.description is not None:
        update_fields.append("description = %s")
        params.append(sanitize_html(book_update.description))

    if book_update.cover_url is not None:
        update_fields.append("cover_url = %s")
        params.append(book_update.cover_url)

    if book_update.tags is not None:
        update_fields.append("tags = %s")
        params.append(json.dumps(book_update.tags))

    if book_update.is_available is not None:
        update_fields.append("is_available = %s")
        params.append(book_update.is_available)

    if update_fields:
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(book_id)
        query = f"UPDATE books SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params)

        # Log activity
        execute_query(
            """INSERT INTO activity_log (user_id, action, item_type, item_id)
               VALUES (%s, %s, %s, %s)""",
            (current_user['id'], 'updated', 'book', book_id)
        )

    return {"success": True, "message": "Book updated successfully"}


@router.delete("/{book_id}")
async def delete_book(
        book_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Delete book (owner only)"""
    # Check ownership
    book = execute_one("SELECT owner_id, title FROM books WHERE id = %s", (book_id,))
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book['owner_id'] != current_user['id'] and not current_user['is_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this book")

    # Check if book has pending requests
    pending_requests = execute_one(
        """SELECT COUNT(*) as count FROM requests 
           WHERE item_type = 'book' AND item_id = %s AND status = 'pending'""",
        (book_id,)
    )

    if pending_requests['count'] > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete book with pending requests"
        )

    # Delete book
    execute_query("DELETE FROM books WHERE id = %s", (book_id,))

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'deleted', 'book', book_id,
         json.dumps({"title": book['title']}))
    )

    return {"success": True, "message": "Book deleted successfully"}


@router.get("/genres/list")
async def get_genres(current_user: dict = Depends(get_current_user)):
    """Get list of all book genres"""
    genres = execute_query(
        """SELECT DISTINCT genre, COUNT(*) as count 
           FROM books 
           WHERE genre IS NOT NULL 
           GROUP BY genre 
           ORDER BY count DESC""",
        fetch=True
    )

    return {"success": True, "data": genres}


@router.get("/my/books")
async def get_my_books(
        available: Optional[bool] = Query(None),
        current_user: dict = Depends(get_current_user)
):
    """Get current user's books"""
    query = """
        SELECT b.*, 
               (SELECT COUNT(*) FROM requests r 
                WHERE r.item_type = 'book' AND r.item_id = b.id 
                AND r.status = 'pending') as pending_requests
        FROM books b 
        WHERE b.owner_id = %s
    """
    params = [current_user['id']]

    if available is not None:
        query += " AND b.is_available = %s"
        params.append(available)

    query += " ORDER BY b.created_at DESC"

    books = execute_query(query, params, fetch=True)

    # Parse JSON fields
    for book in books:
        book['tags'] = json.loads(book['tags']) if book['tags'] else []
        book['created_at'] = book['created_at'].isoformat() if book['created_at'] else None
        book['updated_at'] = book['updated_at'].isoformat() if book['updated_at'] else None

    return {"success": True, "data": books}