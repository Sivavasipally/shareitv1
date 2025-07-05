from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
import json

from database import execute_query, execute_one
from utils.jwt_handler import get_current_user
from utils.validators import validate_date_range

router = APIRouter(prefix="/api/requests", tags=["requests"])


class RequestCreate(BaseModel):
    item_type: str = Field(..., regex="^(book|boardgame)$")
    item_id: int = Field(..., gt=0)
    pickup_date: str = Field(..., description="Format: YYYY-MM-DD")
    return_date: str = Field(..., description="Format: YYYY-MM-DD")
    notes: Optional[str] = Field(None, max_length=500)


class RequestUpdate(BaseModel):
    pickup_date: Optional[str] = Field(None, description="Format: YYYY-MM-DD")
    return_date: Optional[str] = Field(None, description="Format: YYYY-MM-DD")
    notes: Optional[str] = Field(None, max_length=500)


@router.get("/")
async def get_requests(
        status: Optional[str] = Query(None, regex="^(pending|approved|rejected|returned)$"),
        type: Optional[str] = Query(None, regex="^(sent|received)$"),
        item_type: Optional[str] = Query(None, regex="^(book|boardgame)$"),
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
        current_user: dict = Depends(get_current_user)
):
    """Get requests (sent or received)"""
    base_query = """
        SELECT r.*, 
               u1.username as requester_name,
               u1.email as requester_email,
               u2.username as owner_name,
               u2.email as owner_email,
               CASE 
                   WHEN r.item_type = 'book' THEN b.title
                   WHEN r.item_type = 'boardgame' THEN bg.title
               END as item_title,
               CASE 
                   WHEN r.item_type = 'book' THEN b.author
                   WHEN r.item_type = 'boardgame' THEN bg.designer
               END as item_creator,
               CASE 
                   WHEN r.item_type = 'book' THEN b.cover_url
                   WHEN r.item_type = 'boardgame' THEN bg.image_url
               END as item_image,
               COUNT(*) OVER() as total_count
        FROM requests r
        JOIN users u1 ON r.requester_id = u1.id
        JOIN users u2 ON r.owner_id = u2.id
        LEFT JOIN books b ON r.item_type = 'book' AND r.item_id = b.id
        LEFT JOIN board_games bg ON r.item_type = 'boardgame' AND r.item_id = bg.id
        WHERE 1=1
    """

    params = []

    if type == 'sent':
        base_query += " AND r.requester_id = %s"
        params.append(current_user['id'])
    elif type == 'received':
        base_query += " AND r.owner_id = %s"
        params.append(current_user['id'])
    else:
        base_query += " AND (r.requester_id = %s OR r.owner_id = %s)"
        params.extend([current_user['id'], current_user['id']])

    if status:
        base_query += " AND r.status = %s"
        params.append(status)

    if item_type:
        base_query += " AND r.item_type = %s"
        params.append(item_type)

    base_query += " ORDER BY r.request_date DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    requests = execute_query(base_query, params, fetch=True)

    if not requests:
        return {"success": True, "data": [], "total": 0}

    total = requests[0]['total_count'] if requests else 0

    # Format dates and remove count
    for req in requests:
        req['request_date'] = req['request_date'].isoformat() if req['request_date'] else None
        req['response_date'] = req['response_date'].isoformat() if req['response_date'] else None
        req['pickup_date'] = req['pickup_date'].isoformat() if req['pickup_date'] else None
        req['return_date'] = req['return_date'].isoformat() if req['return_date'] else None
        req['is_owner'] = req['owner_id'] == current_user['id']
        req['is_requester'] = req['requester_id'] == current_user['id']
        req.pop('total_count', None)

    return {
        "success": True,
        "data": requests,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_request(
        request_data: RequestCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create a new borrow request"""
    # Validate dates
    if not validate_date_range(request_data.pickup_date, request_data.return_date):
        raise HTTPException(
            status_code=400,
            detail="Invalid date range. Return date must be after pickup date."
        )

    # Check if dates are not in the past
    today = date.today()
    pickup_date = datetime.strptime(request_data.pickup_date, "%Y-%m-%d").date()
    if pickup_date < today:
        raise HTTPException(
            status_code=400,
            detail="Pickup date cannot be in the past"
        )

    # Get item and owner information
    if request_data.item_type == 'book':
        item = execute_one(
            "SELECT owner_id, title, is_available FROM books WHERE id = %s",
            (request_data.item_id,)
        )
    else:
        item = execute_one(
            "SELECT owner_id, title, is_available FROM board_games WHERE id = %s",
            (request_data.item_id,)
        )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item['owner_id'] == current_user['id']:
        raise HTTPException(status_code=400, detail="Cannot request your own item")

    if not item['is_available']:
        raise HTTPException(status_code=400, detail="Item is not available")

    # Check for existing pending request
    existing_request = execute_one(
        """SELECT id FROM requests 
           WHERE item_type = %s AND item_id = %s 
           AND requester_id = %s AND status = 'pending'""",
        (request_data.item_type, request_data.item_id, current_user['id'])
    )

    if existing_request:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending request for this item"
        )

    # Create request
    request_id = execute_query(
        """INSERT INTO requests (item_type, item_id, requester_id, owner_id, 
           pickup_date, return_date, notes)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (request_data.item_type, request_data.item_id, current_user['id'],
         item['owner_id'], request_data.pickup_date, request_data.return_date,
         request_data.notes)
    )

    # Create notification for owner
    execute_query(
        """INSERT INTO notifications (user_id, title, message, type)
           VALUES (%s, %s, %s, %s)""",
        (item['owner_id'], 'New Request',
         f'{current_user["username"]} has requested "{item["title"]}"', 'info')
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'requested', request_data.item_type, request_data.item_id,
         json.dumps({"title": item["title"], "request_id": request_id}))
    )

    return {"success": True, "data": {"id": request_id, "message": "Request created successfully"}}


@router.get("/{request_id}")
async def get_request(
        request_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Get request details"""
    request = execute_one(
        """SELECT r.*, 
                  u1.username as requester_name, u1.email as requester_email,
                  u1.phone_number as requester_phone, u1.preferred_contact as requester_contact,
                  u2.username as owner_name, u2.email as owner_email,
                  u2.phone_number as owner_phone, u2.preferred_contact as owner_contact,
                  CASE 
                      WHEN r.item_type = 'book' THEN b.title
                      WHEN r.item_type = 'boardgame' THEN bg.title
                  END as item_title,
                  CASE 
                      WHEN r.item_type = 'book' THEN b.author
                      WHEN r.item_type = 'boardgame' THEN bg.designer
                  END as item_creator,
                  CASE 
                      WHEN r.item_type = 'book' THEN b.description
                      WHEN r.item_type = 'boardgame' THEN bg.description
                  END as item_description,
                  CASE 
                      WHEN r.item_type = 'book' THEN b.cover_url
                      WHEN r.item_type = 'boardgame' THEN bg.image_url
                  END as item_image
           FROM requests r
           JOIN users u1 ON r.requester_id = u1.id
           JOIN users u2 ON r.owner_id = u2.id
           LEFT JOIN books b ON r.item_type = 'book' AND r.item_id = b.id
           LEFT JOIN board_games bg ON r.item_type = 'boardgame' AND r.item_id = bg.id
           WHERE r.id = %s""",
        (request_id,)
    )

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Check if user has access to this request
    if (request['requester_id'] != current_user['id'] and
            request['owner_id'] != current_user['id'] and
            not current_user['is_admin']):
        raise HTTPException(status_code=403, detail="Not authorized to view this request")

    # Format dates
    request['request_date'] = request['request_date'].isoformat() if request['request_date'] else None
    request['response_date'] = request['response_date'].isoformat() if request['response_date'] else None
    request['pickup_date'] = request['pickup_date'].isoformat() if request['pickup_date'] else None
    request['return_date'] = request['return_date'].isoformat() if request['return_date'] else None

    # Add flags for current user
    request['is_owner'] = request['owner_id'] == current_user['id']
    request['is_requester'] = request['requester_id'] == current_user['id']

    # Hide contact info based on status and user role
    if request['status'] != 'approved':
        if request['is_owner']:
            # Owner can see requester info only for pending requests
            if request['status'] != 'pending':
                request.pop('requester_phone', None)
                request.pop('requester_email', None)
        elif request['is_requester']:
            # Requester cannot see owner contact until approved
            request.pop('owner_phone', None)
            request.pop('owner_email', None)

    return {"success": True, "data": request}


@router.put("/{request_id}")
async def update_request(
        request_id: int,
        update_data: RequestUpdate,
        current_user: dict = Depends(get_current_user)
):
    """Update request (requester only, pending requests only)"""
    request = execute_one(
        "SELECT * FROM requests WHERE id = %s",
        (request_id,)
    )

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request['requester_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")

    if request['status'] != 'pending':
        raise HTTPException(
            status_code=400,
            detail="Can only update pending requests"
        )

    # Validate dates if provided
    if update_data.pickup_date and update_data.return_date:
        if not validate_date_range(update_data.pickup_date, update_data.return_date):
            raise HTTPException(
                status_code=400,
                detail="Invalid date range. Return date must be after pickup date."
            )

    # Build update query
    update_fields = []
    params = []

    if update_data.pickup_date is not None:
        update_fields.append("pickup_date = %s")
        params.append(update_data.pickup_date)

    if update_data.return_date is not None:
        update_fields.append("return_date = %s")
        params.append(update_data.return_date)

    if update_data.notes is not None:
        update_fields.append("notes = %s")
        params.append(update_data.notes)

    if update_fields:
        params.append(request_id)
        query = f"UPDATE requests SET {', '.join(update_fields)} WHERE id = %s"
        execute_query(query, params)

        # Log activity
        execute_query(
            """INSERT INTO activity_log (user_id, action, item_type, item_id)
               VALUES (%s, %s, %s, %s)""",
            (current_user['id'], 'updated_request', 'request', request_id)
        )

    return {"success": True, "message": "Request updated successfully"}


@router.put("/{request_id}/approve")
async def approve_request(
        request_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Approve request (owner only)"""
    request = execute_one(
        "SELECT * FROM requests WHERE id = %s AND owner_id = %s",
        (request_id, current_user['id'])
    )

    if not request:
        raise HTTPException(status_code=404, detail="Request not found or unauthorized")

    if request['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Request is not pending")

    # Get item title for notification
    if request['item_type'] == 'book':
        item = execute_one("SELECT title FROM books WHERE id = %s", (request['item_id'],))
    else:
        item = execute_one("SELECT title FROM board_games WHERE id = %s", (request['item_id'],))

    # Update request
    execute_query(
        """UPDATE requests 
           SET status = 'approved', response_date = CURRENT_TIMESTAMP 
           WHERE id = %s""",
        (request_id,)
    )

    # Update item availability
    if request['item_type'] == 'book':
        execute_query(
            "UPDATE books SET is_available = FALSE WHERE id = %s",
            (request['item_id'],)
        )
    else:
        execute_query(
            "UPDATE board_games SET is_available = FALSE WHERE id = %s",
            (request['item_id'],)
        )

    # Create notification for requester
    execute_query(
        """INSERT INTO notifications (user_id, title, message, type)
           VALUES (%s, %s, %s, %s)""",
        (request['requester_id'], 'Request Approved',
         f'Your request for "{item["title"]}" has been approved!', 'success')
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'approved_request', 'request', request_id,
         json.dumps({"item_title": item["title"]}))
    )

    # Cancel other pending requests for the same item
    execute_query(
        """UPDATE requests 
           SET status = 'rejected', response_date = CURRENT_TIMESTAMP 
           WHERE item_type = %s AND item_id = %s 
           AND status = 'pending' AND id != %s""",
        (request['item_type'], request['item_id'], request_id)
    )

    return {"success": True, "message": "Request approved successfully"}


@router.put("/{request_id}/reject")
async def reject_request(
        request_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Reject request (owner only)"""
    request = execute_one(
        "SELECT * FROM requests WHERE id = %s AND owner_id = %s",
        (request_id, current_user['id'])
    )

    if not request:
        raise HTTPException(status_code=404, detail="Request not found or unauthorized")

    if request['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Request is not pending")

    # Get item title for notification
    if request['item_type'] == 'book':
        item = execute_one("SELECT title FROM books WHERE id = %s", (request['item_id'],))
    else:
        item = execute_one("SELECT title FROM board_games WHERE id = %s", (request['item_id'],))

    # Update request
    execute_query(
        """UPDATE requests 
           SET status = 'rejected', response_date = CURRENT_TIMESTAMP 
           WHERE id = %s""",
        (request_id,)
    )

    # Create notification for requester
    execute_query(
        """INSERT INTO notifications (user_id, title, message, type)
           VALUES (%s, %s, %s, %s)""",
        (request['requester_id'], 'Request Rejected',
         f'Your request for "{item["title"]}" has been rejected.', 'error')
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'rejected_request', 'request', request_id,
         json.dumps({"item_title": item["title"]}))
    )

    return {"success": True, "message": "Request rejected successfully"}


@router.put("/{request_id}/cancel")
async def cancel_request(
        request_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Cancel request (requester only, pending requests only)"""
    request = execute_one(
        "SELECT * FROM requests WHERE id = %s AND requester_id = %s",
        (request_id, current_user['id'])
    )

    if not request:
        raise HTTPException(status_code=404, detail="Request not found or unauthorized")

    if request['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Can only cancel pending requests")

    # Update request
    execute_query(
        """UPDATE requests 
           SET status = 'rejected', response_date = CURRENT_TIMESTAMP 
           WHERE id = %s""",
        (request_id,)
    )

    # Get item title for notification
    if request['item_type'] == 'book':
        item = execute_one("SELECT title FROM books WHERE id = %s", (request['item_id'],))
    else:
        item = execute_one("SELECT title FROM board_games WHERE id = %s", (request['item_id'],))

    # Create notification for owner
    execute_query(
        """INSERT INTO notifications (user_id, title, message, type)
           VALUES (%s, %s, %s, %s)""",
        (request['owner_id'], 'Request Cancelled',
         f'{current_user["username"]} has cancelled their request for "{item["title"]}"', 'info')
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id)
           VALUES (%s, %s, %s, %s)""",
        (current_user['id'], 'cancelled_request', 'request', request_id)
    )

    return {"success": True, "message": "Request cancelled successfully"}


@router.put("/{request_id}/return")
async def return_item(
        request_id: int,
        current_user: dict = Depends(get_current_user)
):
    """Mark item as returned (owner only)"""
    request = execute_one(
        "SELECT * FROM requests WHERE id = %s AND owner_id = %s",
        (request_id, current_user['id'])
    )

    if not request:
        raise HTTPException(status_code=404, detail="Request not found or unauthorized")

    if request['status'] != 'approved':
        raise HTTPException(status_code=400, detail="Can only return approved items")

    # Update request
    execute_query(
        """UPDATE requests 
           SET status = 'returned' 
           WHERE id = %s""",
        (request_id,)
    )

    # Update item availability
    if request['item_type'] == 'book':
        execute_query(
            "UPDATE books SET is_available = TRUE WHERE id = %s",
            (request['item_id'],)
        )
        item = execute_one("SELECT title FROM books WHERE id = %s", (request['item_id'],))
    else:
        execute_query(
            "UPDATE board_games SET is_available = TRUE WHERE id = %s",
            (request['item_id'],)
        )
        item = execute_one("SELECT title FROM board_games WHERE id = %s", (request['item_id'],))

    # Create notification for requester
    execute_query(
        """INSERT INTO notifications (user_id, title, message, type)
           VALUES (%s, %s, %s, %s)""",
        (request['requester_id'], 'Item Returned',
         f'Thank you for returning "{item["title"]}"!', 'success')
    )

    # Log activity
    execute_query(
        """INSERT INTO activity_log (user_id, action, item_type, item_id, details)
           VALUES (%s, %s, %s, %s, %s)""",
        (current_user['id'], 'returned_item', request['item_type'], request['item_id'],
         json.dumps({"title": item["title"], "request_id": request_id}))
    )

    return {"success": True, "message": "Item marked as returned successfully"}


@router.get("/stats/summary")
async def get_request_stats(current_user: dict = Depends(get_current_user)):
    """Get request statistics for current user"""
    stats = {
        'sent': {
            'total': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE requester_id = %s",
                (current_user['id'],)
            )['count'],
            'pending': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE requester_id = %s AND status = 'pending'",
                (current_user['id'],)
            )['count'],
            'approved': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE requester_id = %s AND status = 'approved'",
                (current_user['id'],)
            )['count'],
            'rejected': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE requester_id = %s AND status = 'rejected'",
                (current_user['id'],)
            )['count'],
            'returned': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE requester_id = %s AND status = 'returned'",
                (current_user['id'],)
            )['count']
        },
        'received': {
            'total': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE owner_id = %s",
                (current_user['id'],)
            )['count'],
            'pending': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE owner_id = %s AND status = 'pending'",
                (current_user['id'],)
            )['count'],
            'approved': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE owner_id = %s AND status = 'approved'",
                (current_user['id'],)
            )['count'],
            'rejected': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE owner_id = %s AND status = 'rejected'",
                (current_user['id'],)
            )['count'],
            'returned': execute_one(
                "SELECT COUNT(*) as count FROM requests WHERE owner_id = %s AND status = 'returned'",
                (current_user['id'],)
            )['count']
        }
    }

    return {"success": True, "data": stats}