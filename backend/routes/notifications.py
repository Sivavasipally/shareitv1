from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime

from database import execute_query, execute_one
from utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/")
async def get_notifications(
        is_read: Optional[bool] = Query(None, description="Filter by read status"),
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
        current_user: dict = Depends(get_current_user)
):
    """Get user notifications"""
    query = """
        SELECT *, COUNT(*) OVER() as total_count
        FROM notifications
        WHERE user_id = %s
    """
    params = [current_user['id']]

    if is_read is not None:
        query += " AND is_read = %s"
        params.append(is_read)

    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    notifications = execute_query(query, params, fetch=True)

    if not notifications:
        return {"success": True, "data": [], "total": 0, "unread_count": 0}

    total = notifications[0]['total_count'] if notifications else 0

    # Get unread count
    unread_count = execute_one(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = %s AND is_read = FALSE",
        (current_user['id'],)
    )['count']

    # Format dates and remove count
    for notification in notifications:
        if isinstance(notification['created_at'], datetime):
            notification['created_at'] = notification['created_at'].isoformat()
        notification.pop('total_count', None)

    return {
        "success": True,
        "data": notifications,
        "total": total,
        "unread_count": unread_count,
        "limit": limit,
        "offset": offset
    }

@router.put("/{notification_id}/read")
async def mark_notification_read(
        notification_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    # Check if notification exists and belongs to user
    notification = execute_one(
        "SELECT id FROM notifications WHERE id = %s AND user_id = %s",
        (notification_id, current_user['id'])
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Update notification
    execute_query(
        "UPDATE notifications SET is_read = TRUE WHERE id = %s",
        (notification_id,)
    )

    return {"success": True, "message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_notifications_read(
        current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read"""
    execute_query(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = %s AND is_read = FALSE",
        (current_user['id'],)
    )

    return {"success": True, "message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
        notification_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Delete a notification"""
    # Check if notification exists and belongs to user
    notification = execute_one(
        "SELECT id FROM notifications WHERE id = %s AND user_id = %s",
        (notification_id, current_user['id'])
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Delete notification
    execute_query(
        "DELETE FROM notifications WHERE id = %s",
        (notification_id,)
    )

    return {"success": True, "message": "Notification deleted"}


@router.delete("/")
async def delete_all_notifications(
        current_user: dict = Depends(get_current_user)
):
    """Delete all notifications for the current user"""
    execute_query(
        "DELETE FROM notifications WHERE user_id = %s",
        (current_user['id'],)
    )

    return {"success": True, "message": "All notifications deleted"}


@router.get("/count")
async def get_notification_count(
        current_user: dict = Depends(get_current_user)
):
    """Get notification counts"""
    total_count = execute_one(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = %s",
        (current_user['id'],)
    )['count']

    unread_count = execute_one(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = %s AND is_read = FALSE",
        (current_user['id'],)
    )['count']

    return {
        "success": True,
        "data": {
            "total": total_count,
            "unread": unread_count
        }
    }
