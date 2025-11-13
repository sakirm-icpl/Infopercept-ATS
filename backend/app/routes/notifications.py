from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models.notification import NotificationResponse
from ..models.user import UserResponse
from ..services.notification_service import NotificationService
from ..auth.dependencies import get_current_active_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get notifications for the current user.
    
    Query Parameters:
    - unread_only: If true, return only unread notifications
    - limit: Maximum number of notifications to return (default: 50)
    """
    service = NotificationService()
    notifications = await service.get_user_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit
    )
    return notifications


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get count of unread notifications for the current user.
    """
    service = NotificationService()
    count = await service.get_unread_count(user_id=current_user.id)
    return {"count": count}


@router.put("/{notification_id}/read", response_model=dict)
async def mark_notification_as_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Mark a notification as read.
    """
    service = NotificationService()
    await service.mark_as_read(notification_id=notification_id, user_id=current_user.id)
    return {"message": "Notification marked as read"}


@router.put("/mark-all-read", response_model=dict)
async def mark_all_notifications_as_read(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Mark all notifications as read for the current user.
    """
    service = NotificationService()
    count = await service.mark_all_as_read(user_id=current_user.id)
    return {"message": f"{count} notifications marked as read", "count": count}
