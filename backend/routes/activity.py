from fastapi import APIRouter, Depends, Query
from typing import Optional
import json
from datetime import datetime

from database import execute_query
from utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/activity", tags=["activity"])


@router.get("/")
async def get_activity_log(
        user_id: Optional[int] = Query(None, description="Filter by user ID"),
        action: Optional[str] = Query(None, description="Filter by action"),
        item_type: Optional[str] = Query(None, description="Filter by item type"),
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
        current_user: dict = Depends(get_current_user)
):
    """Get activity log with filters"""
    query = """
        SELECT al.*, u.username,
               COUNT(*) OVER() as total_count
        FROM activity_log al
        JOIN users u ON al.user_id = u.id
        WHERE 1=1
    """
    params = []

    # If not admin, only show user's own activities
    if not current_user.get('is_admin', False):
        query += " AND al.user_id = %s"
        params.append(current_user['id'])
    elif user_id:  # Admin can filter by specific user
        query += " AND al.user_id = %s"
        params.append(user_id)

    if action:
        query += " AND al.action = %s"
        params.append(action)

    if item_type:
        query += " AND al.item_type = %s"
        params.append(item_type)

    query += " ORDER BY al.created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    activities = execute_query(query, params, fetch=True)

    if not activities:
        return {"success": True, "data": [], "total": 0}

    total = activities[0]['total_count'] if activities else 0

    # Format data
    for activity in activities:
        # Format datetime
        if isinstance(activity['created_at'], datetime):
            activity['created_at'] = activity['created_at'].isoformat()

        # Parse details JSON
        if activity['details']:
            try:
                activity['details'] = json.loads(activity['details'])
            except (json.JSONDecodeError, TypeError):
                activity['details'] = None

        activity.pop('total_count', None)

    return {
        "success": True,
        "data": activities,
        "total": total,
        "limit": limit,
        "offset": offset
    }
@router.get("/summary")
async def get_activity_summary(
        days: int = Query(7, ge=1, le=90, description="Number of days to look back"),
        current_user: dict = Depends(get_current_user)
):
    """Get activity summary for the specified number of days"""
    # Check database type
    import os
    db_type = os.getenv('DB_TYPE', 'sqlite').lower()

    if db_type == 'sqlite':
        date_filter = f"al.created_at >= datetime('now', '-{days} days')"
    else:
        date_filter = f"al.created_at >= DATE_SUB(NOW(), INTERVAL {days} DAY)"

    # Base query with user filter for non-admins
    base_where = f"WHERE {date_filter}"
    params = []

    if not current_user.get('is_admin', False):
        base_where += " AND al.user_id = %s"
        params = [current_user['id']]

    # Get activity counts by action
    action_counts = execute_query(
        f"""SELECT action, COUNT(*) as count
            FROM activity_log al
            {base_where}
            GROUP BY action
            ORDER BY count DESC""",
        params,
        fetch=True
    )

    # Get activity counts by item type
    type_counts = execute_query(
        f"""SELECT item_type, COUNT(*) as count
            FROM activity_log al
            {base_where} AND item_type IS NOT NULL
            GROUP BY item_type
            ORDER BY count DESC""",
        params,
        fetch=True
    )

    # Get most active users (for admins only)
    most_active_users = []
    if current_user.get('is_admin', False):
        most_active_users = execute_query(
            f"""SELECT u.username, u.id as user_id, COUNT(*) as activity_count
                FROM activity_log al
                JOIN users u ON al.user_id = u.id
                WHERE {date_filter}
                GROUP BY u.id, u.username
                ORDER BY activity_count DESC
                LIMIT 5""",
            fetch=True
        )

    # Get recent activities
    recent_query = f"""
        SELECT al.*, u.username
        FROM activity_log al
        JOIN users u ON al.user_id = u.id
        {base_where}
        ORDER BY al.created_at DESC
        LIMIT 10
    """

    recent_activities = execute_query(recent_query, params, fetch=True)

    # Format recent activities
    for activity in recent_activities:
        if isinstance(activity['created_at'], datetime):
            activity['created_at'] = activity['created_at'].isoformat()
        if activity['details']:
            try:
                activity['details'] = json.loads(activity['details'])
            except:
                activity['details'] = None

    return {
        "success": True,
        "data": {
            "period_days": days,
            "action_counts": action_counts,
            "type_counts": type_counts,
            "most_active_users": most_active_users,
            "recent_activities": recent_activities
        }
    }