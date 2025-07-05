from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import json
import os

from database import execute_query, execute_one
from utils.jwt_handler import get_current_user, require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


class UserUpdate(BaseModel):
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class CommunityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None


@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(require_admin)):
    """Get overall platform statistics"""
    # Check database type
    db_type = os.getenv('DB_TYPE', 'sqlite').lower()

    # Basic counts
    stats = {
        'users': {
            'total': execute_one("SELECT COUNT(*) as count FROM users")['count'],
            'active': execute_one("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE")['count'],
            'admins': execute_one("SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE")['count'],
        },
        'books': {
            'total': execute_one("SELECT COUNT(*) as count FROM books")['count'],
            'available': execute_one("SELECT COUNT(*) as count FROM books WHERE is_available = TRUE")['count'],
            'genres': execute_one("SELECT COUNT(DISTINCT genre) as count FROM books WHERE genre IS NOT NULL")['count']
        },
        'boardgames': {
            'total': execute_one("SELECT COUNT(*) as count FROM board_games")['count'],
            'available': execute_one("SELECT COUNT(*) as count FROM board_games WHERE is_available = TRUE")['count'],
            'easy': execute_one("SELECT COUNT(*) as count FROM board_games WHERE complexity = 'Easy'")['count'],
            'medium': execute_one("SELECT COUNT(*) as count FROM board_games WHERE complexity = 'Medium'")['count'],
            'hard': execute_one("SELECT COUNT(*) as count FROM board_games WHERE complexity = 'Hard'")['count']
        },
        'requests': {
            'total': execute_one("SELECT COUNT(*) as count FROM requests")['count'],
            'pending': execute_one("SELECT COUNT(*) as count FROM requests WHERE status = 'pending'")['count'],
            'approved': execute_one("SELECT COUNT(*) as count FROM requests WHERE status = 'approved'")['count'],
            'rejected': execute_one("SELECT COUNT(*) as count FROM requests WHERE status = 'rejected'")['count'],
            'returned': execute_one("SELECT COUNT(*) as count FROM requests WHERE status = 'returned'")['count'],
            'active_loans': execute_one("SELECT COUNT(*) as count FROM requests WHERE status = 'approved'")['count']
        }
    }

    # New users this week - database specific query
    if db_type == 'sqlite':
        # SQLite version
        new_users_count = execute_one(
            "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')"
        )['count']
    else:
        # MySQL version
        new_users_count = execute_one(
            "SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        )['count']

    stats['users']['new_this_week'] = new_users_count

    # Recent activities
    recent_activities = execute_query(
        """SELECT al.*, u.username 
           FROM activity_log al 
           JOIN users u ON al.user_id = u.id 
           ORDER BY al.created_at DESC 
           LIMIT 20""",
        fetch=True
    )

    # Format dates and details
    for activity in recent_activities:
        created_at_val = activity.get('created_at')
        # Check if the value is a datetime object before formatting
        if isinstance(created_at_val, datetime):
            activity['created_at'] = created_at_val.isoformat()

        if activity.get('details'):
            try:
                # Safely load JSON details
                activity['details'] = json.loads(activity['details'])
            except (json.JSONDecodeError, TypeError):
                # If it's not valid JSON or not a string, keep the original value
                pass

    stats['recent_activities'] = recent_activities

    # Top users
    top_lenders = execute_query(
        """SELECT u.id, u.username, COUNT(r.id) as loans_count
           FROM users u
           JOIN requests r ON u.id = r.owner_id
           WHERE r.status IN ('approved', 'returned')
           GROUP BY u.id, u.username
           ORDER BY loans_count DESC
           LIMIT 5""",
        fetch=True
    )

    top_borrowers = execute_query(
        """SELECT u.id, u.username, COUNT(r.id) as borrows_count
           FROM users u
           JOIN requests r ON u.id = r.requester_id
           WHERE r.status IN ('approved', 'returned')
           GROUP BY u.id, u.username
           ORDER BY borrows_count DESC
           LIMIT 5""",
        fetch=True
    )

    stats['top_users'] = {
        'lenders': top_lenders,
        'borrowers': top_borrowers
    }

    return {"success": True, "data": stats}


@router.get("/users")
async def get_users(
        search: Optional[str] = Query(None),
        is_active: Optional[bool] = Query(None),
        is_admin: Optional[bool] = Query(None),
        limit: int = Query(50, ge=1, le=200),
        offset: int = Query(0, ge=0),
        current_user: dict = Depends(require_admin)
):
    """Get all users with filters"""
    # Check database type
    db_type = os.getenv('DB_TYPE', 'sqlite').lower()

    # Build query based on database type
    if db_type == 'sqlite':
        # SQLite version with window function
        query = """
            WITH user_counts AS (
                SELECT u.id, u.username, u.email, u.full_name, u.is_admin, 
                       u.is_active, u.created_at, u.updated_at,
                       COUNT(DISTINCT b.id) as books_count,
                       COUNT(DISTINCT bg.id) as boardgames_count
                FROM users u
                LEFT JOIN books b ON u.id = b.owner_id
                LEFT JOIN board_games bg ON u.id = bg.owner_id
                WHERE 1=1
        """
    else:
        # MySQL version
        query = """
            SELECT u.id, u.username, u.email, u.full_name, u.is_admin, 
                   u.is_active, u.created_at, u.updated_at,
                   COUNT(DISTINCT b.id) as books_count,
                   COUNT(DISTINCT bg.id) as boardgames_count,
                   COUNT(*) OVER() as total_count
            FROM users u
            LEFT JOIN books b ON u.id = b.owner_id
            LEFT JOIN board_games bg ON u.id = bg.owner_id
            WHERE 1=1
        """

    params = []

    if search:
        query += " AND (u.username LIKE %s OR u.email LIKE %s OR u.full_name LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    if is_active is not None:
        query += " AND u.is_active = %s"
        params.append(is_active)

    if is_admin is not None:
        query += " AND u.is_admin = %s"
        params.append(is_admin)

    if db_type == 'sqlite':
        # Complete SQLite query
        query += """
                GROUP BY u.id
            )
            SELECT *, (SELECT COUNT(*) FROM users) as total_count
            FROM user_counts
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
        """
    else:
        # Complete MySQL query
        query += " GROUP BY u.id ORDER BY u.created_at DESC LIMIT %s OFFSET %s"

    params.extend([limit, offset])

    users = execute_query(query, params, fetch=True)

    if not users:
        return {"success": True, "data": [], "total": 0}

    total = users[0]['total_count'] if users else 0

    # Format dates and remove count
    for user in users:
        user['created_at'] = user['created_at'].isoformat() if isinstance(user['created_at'], datetime) else user[
            'created_at']
        user['updated_at'] = user['updated_at'].isoformat() if isinstance(user['updated_at'], datetime) else user[
            'updated_at']
        user.pop('total_count', None)

    return {
        "success": True,
        "data": users,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/users/{user_id}")
async def get_user_details(
        user_id: int,
        current_user: dict = Depends(require_admin)
):
    """Get detailed user information"""
    user = execute_one(
        """SELECT u.*, 
                  COUNT(DISTINCT b.id) as books_count,
                  COUNT(DISTINCT bg.id) as boardgames_count
           FROM users u
           LEFT JOIN books b ON u.id = b.owner_id
           LEFT JOIN board_games bg ON u.id = bg.owner_id
           WHERE u.id = %s
           GROUP BY u.id""",
        (user_id,)
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Parse JSON fields
    if user['contact_times']:
        user['contact_times'] = json.loads(user['contact_times'])
    if user['interests']:
        user['interests'] = json.loads(user['interests'])

    # Get request statistics
    user['request_stats'] = {
        'sent': execute_one(
            "SELECT COUNT(*) as count FROM requests WHERE requester_id = %s",
            (user_id,)
        )['count'],
        'received': execute_one(
            "SELECT COUNT(*) as count FROM requests WHERE owner_id = %s",
            (user_id,)
        )['count'],
        'pending': execute_one(
            """SELECT COUNT(*) as count FROM requests 
               WHERE (requester_id = %s OR owner_id = %s) AND status = 'pending'""",
            (user_id, user_id)
        )['count']
    }

    # Get recent activity
    recent_activity = execute_query(
        """SELECT * FROM activity_log 
           WHERE user_id = %s 
           ORDER BY created_at DESC 
           LIMIT 10""",
        (user_id,),
        fetch=True
    )

    for activity in recent_activity:
        activity['created_at'] = activity['created_at'].isoformat() if isinstance(activity['created_at'], datetime) else \
        activity['created_at']
        if activity['details']:
            try:
                activity['details'] = json.loads(activity['details'])
            except:
                pass

    user['recent_activity'] = recent_activity

    # Format dates
    user['created_at'] = user['created_at'].isoformat() if isinstance(user['created_at'], datetime) else user[
        'created_at']
    user['updated_at'] = user['updated_at'].isoformat() if isinstance(user['updated_at'], datetime) else user[
        'updated_at']

    # Remove password hash
    user.pop('password_hash', None)

    return {"success": True, "data": user}


@router.put("/users/{user_id}")
async def update_user(
        user_id: int,
        updates: UserUpdate,
        current_user: dict = Depends(require_admin)
):
    """Update user admin/active status"""
    # Check if user exists
    user = execute_one("SELECT id, is_admin FROM users WHERE id = %s", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent removing admin status from self
    if user_id == current_user['id'] and updates.is_admin is False:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove admin status from yourself"
        )

    # Prevent removing last admin
    if updates.is_admin is False and user['is_admin']:
        admin_count = execute_one("SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE")['count']
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot remove the last admin"
            )

    # Build update query
    update_fields = []
    params = []

    if updates.is_admin is not None:
        update_fields.append("is_admin = %s")
        params.append(updates.is_admin)

    if updates.is_active is not None:
        update_fields.append("is_active = %s")
        params.append(updates.is_active)

    if update_fields:
        params.append(user_id)
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params)

        # Log activity
        changes = {}
        if updates.is_admin is not None:
            changes['is_admin'] = updates.is_admin
        if updates.is_active is not None:
            changes['is_active'] = updates.is_active

        execute_query(
            """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
               VALUES (%s, %s, %s, %s, %s)""",
            (current_user['id'], 'updated_user', 'user', user_id, json.dumps(changes))
        )

    return {"success": True, "message": "User updated successfully"}


@router.delete("/users/{user_id}")
async def delete_user(
        user_id: int,
        current_user: dict = Depends(require_admin)
):
    """Permanently delete a user and all their data"""
    # Prevent self-deletion
    if user_id == current_user['id']:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    # Check if user exists
    user = execute_one("SELECT id, is_admin, username FROM users WHERE id = %s", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deleting last admin
    if user['is_admin']:
        admin_count = execute_one("SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE")['count']
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the last admin"
            )

    # Delete user's data in order (due to foreign key constraints)
    # 1. Delete notifications
    execute_query("DELETE FROM notifications WHERE user_id = %s", (user_id,))

    # 2. Delete activity logs
    execute_query("DELETE FROM activity_log WHERE user_id = %s", (user_id,))

    # 3. Delete requests (both as requester and owner)
    execute_query("DELETE FROM requests WHERE requester_id = %s OR owner_id = %s", (user_id, user_id))

    # 4. Delete books
    execute_query("DELETE FROM books WHERE owner_id = %s", (user_id,))

    # 5. Delete board games
    execute_query("DELETE FROM board_games WHERE owner_id = %s", (user_id,))

    # 6. Delete community memberships
    execute_query("DELETE FROM community_members WHERE user_id = %s", (user_id,))

    # 7. Finally, delete the user
    execute_query("DELETE FROM users WHERE id = %s", (user_id,))

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'deleted_user', 'user', user_id,
         json.dumps({"username": user['username']}))
    )

    return {"success": True, "message": "User and all associated data deleted successfully"}


@router.get("/activity")
async def get_activity_log(
        user_id: Optional[int] = Query(None),
        action: Optional[str] = Query(None),
        item_type: Optional[str] = Query(None),
        limit: int = Query(100, ge=1, le=500),
        offset: int = Query(0, ge=0),
        current_user: dict = Depends(require_admin)
):
    """Get activity log with filters"""
    # Check database type
    db_type = os.getenv('DB_TYPE', 'sqlite').lower()

    if db_type == 'sqlite':
        # SQLite version
        query = """
            WITH activity_data AS (
                SELECT al.*, u.username
                FROM activity_log al
                JOIN users u ON al.user_id = u.id
                WHERE 1=1
        """
    else:
        # MySQL version
        query = """
            SELECT al.*, u.username,
                   COUNT(*) OVER() as total_count
            FROM activity_log al
            JOIN users u ON al.user_id = u.id
            WHERE 1=1
        """

    params = []

    if user_id:
        query += " AND al.user_id = %s"
        params.append(user_id)

    if action:
        query += " AND al.action = %s"
        params.append(action)

    if item_type:
        query += " AND al.item_type = %s"
        params.append(item_type)

    if db_type == 'sqlite':
        # Complete SQLite query
        query += """
            )
            SELECT *, (SELECT COUNT(*) FROM activity_log) as total_count
            FROM activity_data
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
    else:
        # Complete MySQL query
        query += " ORDER BY al.created_at DESC LIMIT %s OFFSET %s"

    params.extend([limit, offset])

    activities = execute_query(query, params, fetch=True)

    if not activities:
        return {"success": True, "data": [], "total": 0}

    total = activities[0]['total_count'] if activities else 0

    # Format data
    for activity in activities:
        activity['created_at'] = activity['created_at'].isoformat() if isinstance(activity['created_at'], datetime) else \
        activity['created_at']
        if activity['details']:
            try:
                activity['details'] = json.loads(activity['details'])
            except:
                pass
        activity.pop('total_count', None)

    return {
        "success": True,
        "data": activities,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.post("/communities")
async def create_community(
        community: CommunityCreate,
        current_user: dict = Depends(require_admin)
):
    """Create a new community"""
    community_id = execute_query(
        """INSERT INTO communities (name, description, location, created_by)
           VALUES (%s, %s, %s, %s)""",
        (community.name, community.description, community.location, current_user['id'])
    )

    # Add creator as admin member
    execute_query(
        """INSERT INTO community_members (community_id, user_id, role)
           VALUES (%s, %s, %s)""",
        (community_id, current_user['id'], 'admin')
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'created_community', 'community', community_id,
         json.dumps({"name": community.name}))
    )

    return {"success": True, "data": {"id": community_id, "message": "Community created successfully"}}


@router.get("/communities")
async def get_communities(current_user: dict = Depends(require_admin)):
    """Get all communities"""
    communities = execute_query(
        """SELECT c.*, u.username as created_by_name,
                  COUNT(DISTINCT cm.user_id) as member_count
           FROM communities c
           JOIN users u ON c.created_by = u.id
           LEFT JOIN community_members cm ON c.id = cm.community_id
           GROUP BY c.id
           ORDER BY c.created_at DESC""",
        fetch=True
    )

    for community in communities:
        community['created_at'] = community['created_at'].isoformat() if isinstance(community['created_at'],
                                                                                    datetime) else community[
            'created_at']

    return {"success": True, "data": communities}


@router.get("/reports/usage")
async def get_usage_report(
        days: int = Query(30, ge=1, le=365),
        current_user: dict = Depends(require_admin)
):
    """Get usage report for specified number of days"""
    # Check database type
    db_type = os.getenv('DB_TYPE', 'sqlite').lower()

    report = {
        'period': f"Last {days} days",
        'summary': {}
    }

    if db_type == 'sqlite':
        # SQLite versions of the queries
        report['summary']['new_users'] = execute_one(
            f"SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-{days} days')"
        )['count']

        report['summary']['new_books'] = execute_one(
            f"SELECT COUNT(*) as count FROM books WHERE created_at >= datetime('now', '-{days} days')"
        )['count']

        report['summary']['new_boardgames'] = execute_one(
            f"SELECT COUNT(*) as count FROM board_games WHERE created_at >= datetime('now', '-{days} days')"
        )['count']

        report['summary']['total_requests'] = execute_one(
            f"SELECT COUNT(*) as count FROM requests WHERE request_date >= datetime('now', '-{days} days')"
        )['count']
    else:
        # MySQL versions of the queries
        report['summary']['new_users'] = execute_one(
            f"SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL {days} DAY)"
        )['count']

        report['summary']['new_books'] = execute_one(
            f"SELECT COUNT(*) as count FROM books WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL {days} DAY)"
        )['count']

        report['summary']['new_boardgames'] = execute_one(
            f"SELECT COUNT(*) as count FROM board_games WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL {days} DAY)"
        )['count']

        report['summary']['total_requests'] = execute_one(
            f"SELECT COUNT(*) as count FROM requests WHERE request_date >= DATE_SUB(CURRENT_DATE, INTERVAL {days} DAY)"
        )['count']

    return {"success": True, "data": report}