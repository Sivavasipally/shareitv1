from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from typing import Optional, List
import json

from database import execute_query, execute_one
from utils.jwt_handler import get_current_user
from utils.validators import sanitize_html

router = APIRouter(prefix="/api/boardgames", tags=["boardgames"])


class BoardGameCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    designer: Optional[str] = Field(None, max_length=100)
    min_players: Optional[int] = Field(None, ge=1, le=20)
    max_players: Optional[int] = Field(None, ge=1, le=20)
    play_time: Optional[str] = Field(None, max_length=50)
    complexity: Optional[str] = Field(None, pattern="^(Easy|Medium|Hard)$")
    description: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=500)
    categories: Optional[List[str]] = []
    components: Optional[List[str]] = []


class BoardGameUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    designer: Optional[str] = Field(None, max_length=100)
    min_players: Optional[int] = Field(None, ge=1, le=20)
    max_players: Optional[int] = Field(None, ge=1, le=20)
    play_time: Optional[str] = Field(None, max_length=50)
    complexity: Optional[str] = Field(None, pattern="^(Easy|Medium|Hard)$")
    description: Optional[str] = Field(None, max_length=2000)
    image_url: Optional[str] = Field(None, max_length=500)
    categories: Optional[List[str]] = None
    components: Optional[List[str]] = None
    is_available: Optional[bool] = None


@router.get("/")
async def get_boardgames(
        search: Optional[str] = Query(None, description="Search in title or designer"),
        complexity: Optional[str] = Query(None, pattern="^(Easy|Medium|Hard)$"),
        available: Optional[bool] = Query(None, description="Filter by availability"),
        min_players: Optional[int] = Query(None, ge=1),
        max_players: Optional[int] = Query(None, le=20),
        owner_id: Optional[int] = Query(None, description="Filter by owner"),
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
        current_user: dict = Depends(get_current_user)
):
    """Get all board games with filters"""
    query = """
        SELECT bg.*, u.username as owner_name,
               CASE WHEN bg.categories IS NOT NULL THEN bg.categories ELSE '[]' END as categories,
               CASE WHEN bg.components IS NOT NULL THEN bg.components ELSE '[]' END as components,
               COUNT(*) OVER() as total_count
        FROM board_games bg 
        JOIN users u ON bg.owner_id = u.id 
        WHERE 1=1
    """
    params = []

    if search:
        query += " AND (bg.title LIKE %s OR bg.designer LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    if complexity:
        query += " AND bg.complexity = %s"
        params.append(complexity)

    if available is not None:
        query += " AND bg.is_available = %s"
        params.append(available)

    if min_players is not None:
        query += " AND bg.min_players <= %s AND bg.max_players >= %s"
        params.extend([min_players, min_players])

    if max_players is not None:
        query += " AND bg.max_players >= %s"
        params.append(max_players)

    if owner_id:
        query += " AND bg.owner_id = %s"
        params.append(owner_id)

    query += " ORDER BY bg.created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    games = execute_query(query, params, fetch=True)

    if not games:
        return {"success": True, "data": [], "total": 0}

    total = games[0]['total_count'] if games else 0

    # Parse JSON fields and format dates
    for game in games:
        game['categories'] = json.loads(game['categories']) if game['categories'] else []
        game['components'] = json.loads(game['components']) if game['components'] else []
        game['created_at'] = game['created_at'].isoformat() if game['created_at'] else None
        game['updated_at'] = game['updated_at'].isoformat() if game['updated_at'] else None
        game.pop('total_count', None)

    return {
        "success": True,
        "data": games,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_boardgame(
        game: BoardGameCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create a new board game"""
    # Validate min/max players
    if game.min_players and game.max_players:
        if game.min_players > game.max_players:
            raise HTTPException(
                status_code=400,
                detail="Minimum players cannot be greater than maximum players"
            )

    # Sanitize description
    if game.description:
        game.description = sanitize_html(game.description)

    game_id = execute_query(
        """INSERT INTO board_games (title, designer, min_players, max_players, 
           play_time, complexity, description, image_url, owner_id, categories, components)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (game.title, game.designer, game.min_players, game.max_players,
         game.play_time, game.complexity, game.description, game.image_url,
         current_user['id'], json.dumps(game.categories), json.dumps(game.components))
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'added', 'boardgame', game_id,
         json.dumps({"title": game.title, "designer": game.designer}))
    )

    # Create notification
    execute_query(
        """INSERT INTO notifications (user_id, title, message, type)
           VALUES (%s, %s, %s, %s)""",
        (current_user['id'], 'Board Game Added',
         f'You have successfully added "{game.title}"', 'success')
    )

    return {"success": True, "data": {"id": game_id, "message": "Board game created successfully"}}


@router.get("/{game_id}")
async def get_boardgame(
        game_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Get board game by ID"""
    game = execute_one(
        """SELECT bg.*, u.username as owner_name, u.email as owner_email,
                  u.phone_number as owner_phone, u.preferred_contact
           FROM board_games bg 
           JOIN users u ON bg.owner_id = u.id 
           WHERE bg.id = %s""",
        (game_id,)
    )

    if not game:
        raise HTTPException(status_code=404, detail="Board game not found")

    game['categories'] = json.loads(game['categories']) if game['categories'] else []
    game['components'] = json.loads(game['components']) if game['components'] else []
    game['created_at'] = game['created_at'].isoformat() if game['created_at'] else None
    game['updated_at'] = game['updated_at'].isoformat() if game['updated_at'] else None

    # Hide owner contact info if game is not available and user is not the owner
    if not game['is_available'] and game['owner_id'] != current_user['id']:
        game.pop('owner_email', None)
        game.pop('owner_phone', None)

    return {"success": True, "data": game}


@router.put("/{game_id}")
async def update_boardgame(
        game_id: int,
        game_update: BoardGameUpdate,
        current_user: dict = Depends(get_current_user)
):
    """Update board game (owner only)"""
    # Check ownership
    game = execute_one("SELECT owner_id FROM board_games WHERE id = %s", (game_id,))
    if not game:
        raise HTTPException(status_code=404, detail="Board game not found")

    if game['owner_id'] != current_user['id'] and not current_user['is_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to update this board game")

    # Validate min/max players if both provided
    if game_update.min_players and game_update.max_players:
        if game_update.min_players > game_update.max_players:
            raise HTTPException(
                status_code=400,
                detail="Minimum players cannot be greater than maximum players"
            )

    # Build update query
    update_fields = []
    params = []

    if game_update.title is not None:
        update_fields.append("title = %s")
        params.append(game_update.title)

    if game_update.designer is not None:
        update_fields.append("designer = %s")
        params.append(game_update.designer)

    if game_update.min_players is not None:
        update_fields.append("min_players = %s")
        params.append(game_update.min_players)

    if game_update.max_players is not None:
        update_fields.append("max_players = %s")
        params.append(game_update.max_players)

    if game_update.play_time is not None:
        update_fields.append("play_time = %s")
        params.append(game_update.play_time)

    if game_update.complexity is not None:
        update_fields.append("complexity = %s")
        params.append(game_update.complexity)

    if game_update.description is not None:
        update_fields.append("description = %s")
        params.append(sanitize_html(game_update.description))

    if game_update.image_url is not None:
        update_fields.append("image_url = %s")
        params.append(game_update.image_url)

    if game_update.categories is not None:
        update_fields.append("categories = %s")
        params.append(json.dumps(game_update.categories))

    if game_update.components is not None:
        update_fields.append("components = %s")
        params.append(json.dumps(game_update.components))

    if game_update.is_available is not None:
        update_fields.append("is_available = %s")
        params.append(game_update.is_available)

    if update_fields:
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(game_id)
        query = f"UPDATE board_games SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params)

        # Log activity
        execute_query(
            """INSERT INTO activity_log (user_id, action, item_type, item_id)
               VALUES (%s, %s, %s, %s)""",
            (current_user['id'], 'updated', 'boardgame', game_id)
        )

    return {"success": True, "message": "Board game updated successfully"}


@router.delete("/{game_id}")
async def delete_boardgame(
        game_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Delete board game (owner only)"""
    # Check ownership
    game = execute_one("SELECT owner_id, title FROM board_games WHERE id = %s", (game_id,))
    if not game:
        raise HTTPException(status_code=404, detail="Board game not found")

    if game['owner_id'] != current_user['id'] and not current_user['is_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this board game")

    # Check if game has pending requests
    pending_requests = execute_one(
        """SELECT COUNT(*) as count FROM requests 
           WHERE item_type = 'boardgame' AND item_id = %s AND status = 'pending'""",
        (game_id,)
    )

    if pending_requests['count'] > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete board game with pending requests"
        )

    # Delete game
    execute_query("DELETE FROM board_games WHERE id = %s", (game_id,))

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'deleted', 'boardgame', game_id,
         json.dumps({"title": game['title']}))
    )

    return {"success": True, "message": "Board game deleted successfully"}


@router.get("/complexities/list")
async def get_complexities(current_user: dict = Depends(get_current_user)):
    """Get list of all complexities with counts"""
    complexities = execute_query(
        """SELECT complexity, COUNT(*) as count 
           FROM board_games 
           WHERE complexity IS NOT NULL 
           GROUP BY complexity 
           ORDER BY 
             CASE complexity 
               WHEN 'Easy' THEN 1 
               WHEN 'Medium' THEN 2 
               WHEN 'Hard' THEN 3 
             END""",
        fetch=True
    )

    return {"success": True, "data": complexities}


@router.get("/categories/list")
async def get_categories(current_user: dict = Depends(get_current_user)):
    """Get list of all board game categories"""
    # Since categories are stored as JSON, we need to extract them
    games = execute_query(
        "SELECT categories FROM board_games WHERE categories IS NOT NULL",
        fetch=True
    )

    # Extract unique categories
    category_count = {}
    for game in games:
        categories = json.loads(game['categories']) if game['categories'] else []
        for category in categories:
            category_count[category] = category_count.get(category, 0) + 1

    # Convert to list format
    categories = [
        {"category": cat, "count": count}
        for cat, count in sorted(
            category_count.items(),
            key=lambda x: x[1],
            reverse=True
        )
    ]

    return {"success": True, "data": categories}


@router.get("/my/boardgames")
async def get_my_boardgames(
        available: Optional[bool] = Query(None),
        current_user: dict = Depends(get_current_user)
):
    """Get current user's board games"""
    query = """
        SELECT bg.*, 
               (SELECT COUNT(*) FROM requests r 
                WHERE r.item_type = 'boardgame' AND r.item_id = bg.id 
                AND r.status = 'pending') as pending_requests
        FROM board_games bg 
        WHERE bg.owner_id = %s
    """
    params = [current_user['id']]

    if available is not None:
        query += " AND bg.is_available = %s"
        params.append(available)

    query += " ORDER BY bg.created_at DESC"

    games = execute_query(query, params, fetch=True)

    # Parse JSON fields
    for game in games:
        game['categories'] = json.loads(game['categories']) if game['categories'] else []
        game['components'] = json.loads(game['components']) if game['components'] else []
        game['created_at'] = game['created_at'].isoformat() if game['created_at'] else None
        game['updated_at'] = game['updated_at'].isoformat() if game['updated_at'] else None

    return {"success": True, "data": games}