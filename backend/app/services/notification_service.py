from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
from ..database import get_database
from ..models.notification import NotificationModel, NotificationResponse
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications."""
    
    def __init__(self):
        self.db = get_database()
    
    async def create_notification(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        application_id: str,
        stage_number: int
    ) -> NotificationModel:
        """
        Create a new notification.
        
        Args:
            user_id: User ID who receives the notification
            notification_type: Type of notification (assignment, reassignment, deadline_warning)
            title: Notification title
            message: Notification message
            application_id: Related application ID
            stage_number: Related stage number
            
        Returns:
            NotificationModel: Created notification
        """
        notification = NotificationModel(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            application_id=application_id,
            stage_number=stage_number,
            is_read=False,
            created_at=datetime.utcnow()
        )
        
        notification_dict = notification.dict()
        result = await self.db.notifications.insert_one(notification_dict)
        notification_dict["_id"] = result.inserted_id
        
        logger.info(f"Created notification for user {user_id}: {title}")
        
        return notification
    
    async def send_assignment_notification(
        self,
        user_id: str,
        application_id: str,
        stage_number: int,
        assigned_by_name: str,
        candidate_name: str,
        job_title: str
    ):
        """
        Send notification when a stage is assigned.
        
        Args:
            user_id: User ID of the assigned team member
            application_id: Application ID
            stage_number: Stage number
            assigned_by_name: Name of admin who assigned
            candidate_name: Name of the candidate
            job_title: Job title
        """
        stage_name = self._get_stage_name(stage_number)
        
        title = f"New Stage Assignment: {stage_name}"
        message = f"{assigned_by_name} assigned you to {stage_name} for {candidate_name} ({job_title})"
        
        await self.create_notification(
            user_id=user_id,
            notification_type="assignment",
            title=title,
            message=message,
            application_id=application_id,
            stage_number=stage_number
        )
    
    async def send_bulk_assignment_notification(
        self,
        user_id: str,
        application_id: str,
        stage_count: int,
        stage_list: str,
        assigned_by_name: str,
        candidate_name: str,
        job_title: str
    ):
        """
        Send notification when multiple stages are assigned at once.
        
        Args:
            user_id: User ID of the assigned team member
            application_id: Application ID
            stage_count: Number of stages assigned
            stage_list: Comma-separated list of stage numbers
            assigned_by_name: Name of admin who assigned
            candidate_name: Name of the candidate
            job_title: Job title
        """
        title = f"Bulk Assignment: {stage_count} Stages"
        message = f"{assigned_by_name} assigned you to {stage_count} stages ({stage_list}) for {candidate_name} ({job_title})"
        
        # Use stage_number=0 to indicate bulk assignment (or use the first stage)
        await self.create_notification(
            user_id=user_id,
            notification_type="bulk_assignment",
            title=title,
            message=message,
            application_id=application_id,
            stage_number=0  # Special indicator for bulk assignment
        )
    
    async def send_reassignment_notification(
        self,
        old_user_id: str,
        new_user_id: str,
        application_id: str,
        stage_number: int,
        assigned_by_name: str,
        candidate_name: str,
        job_title: str,
        reason: Optional[str] = None
    ):
        """
        Send notifications when a stage is reassigned.
        
        Args:
            old_user_id: User ID of the previously assigned team member
            new_user_id: User ID of the newly assigned team member
            application_id: Application ID
            stage_number: Stage number
            assigned_by_name: Name of admin who reassigned
            candidate_name: Name of the candidate
            job_title: Job title
            reason: Reason for reassignment
        """
        stage_name = self._get_stage_name(stage_number)
        
        # Notification for old assignee
        old_title = f"Stage Reassigned: {stage_name}"
        old_message = f"{assigned_by_name} reassigned {stage_name} for {candidate_name} ({job_title}) to another team member"
        if reason:
            old_message += f". Reason: {reason}"
        
        await self.create_notification(
            user_id=old_user_id,
            notification_type="reassignment",
            title=old_title,
            message=old_message,
            application_id=application_id,
            stage_number=stage_number
        )
        
        # Notification for new assignee
        new_title = f"New Stage Assignment: {stage_name}"
        new_message = f"{assigned_by_name} assigned you to {stage_name} for {candidate_name} ({job_title}) (reassigned)"
        if reason:
            new_message += f". Reason: {reason}"
        
        await self.create_notification(
            user_id=new_user_id,
            notification_type="reassignment",
            title=new_title,
            message=new_message,
            application_id=application_id,
            stage_number=stage_number
        )
    
    async def send_deadline_warning_notification(
        self,
        user_id: str,
        application_id: str,
        stage_number: int,
        candidate_name: str,
        job_title: str,
        deadline: datetime
    ):
        """
        Send notification when a deadline is approaching.
        
        Args:
            user_id: User ID of the assigned team member
            application_id: Application ID
            stage_number: Stage number
            candidate_name: Name of the candidate
            job_title: Job title
            deadline: Deadline datetime
        """
        stage_name = self._get_stage_name(stage_number)
        
        # Calculate hours remaining
        hours_remaining = int((deadline - datetime.utcnow()).total_seconds() / 3600)
        
        title = f"Deadline Approaching: {stage_name}"
        message = f"The deadline for {stage_name} for {candidate_name} ({job_title}) is in {hours_remaining} hours"
        
        await self.create_notification(
            user_id=user_id,
            notification_type="deadline_warning",
            title=title,
            message=message,
            application_id=application_id,
            stage_number=stage_number
        )
    
    async def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[NotificationResponse]:
        """
        Get notifications for a user.
        
        Args:
            user_id: User ID
            unread_only: If True, return only unread notifications
            limit: Maximum number of notifications to return
            
        Returns:
            List of NotificationResponse objects
        """
        query = {"user_id": user_id}
        if unread_only:
            query["is_read"] = False
        
        cursor = self.db.notifications.find(query).sort("created_at", -1).limit(limit)
        
        notifications = []
        async for notification in cursor:
            notification_id = str(notification["_id"])
            del notification["_id"]
            
            # Get application details
            try:
                application = await self.db.applications.find_one(
                    {"_id": ObjectId(notification["application_id"])}
                )
                
                if application:
                    # Get job details
                    job = await self.db.jobs.find_one({"_id": ObjectId(application["job_id"])})
                    
                    notification_response = NotificationResponse(
                        id=notification_id,
                        **notification,
                        candidate_name=application.get("name"),
                        job_title=job.get("title") if job else "Unknown Job",
                        stage_name=self._get_stage_name(notification["stage_number"])
                    )
                    notifications.append(notification_response)
            except Exception as e:
                logger.error(f"Error fetching notification details: {e}")
                # Still include notification even if details can't be fetched
                notification_response = NotificationResponse(
                    id=notification_id,
                    **notification,
                    stage_name=self._get_stage_name(notification["stage_number"])
                )
                notifications.append(notification_response)
        
        return notifications
    
    async def get_unread_count(self, user_id: str) -> int:
        """
        Get count of unread notifications for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Count of unread notifications
        """
        count = await self.db.notifications.count_documents({
            "user_id": user_id,
            "is_read": False
        })
        return count
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """
        Mark a notification as read.
        
        Args:
            notification_id: Notification ID
            user_id: User ID (for authorization)
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If notification not found or unauthorized
        """
        try:
            result = await self.db.notifications.update_one(
                {
                    "_id": ObjectId(notification_id),
                    "user_id": user_id
                },
                {
                    "$set": {
                        "is_read": True,
                        "read_at": datetime.utcnow()
                    }
                }
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Notification not found or unauthorized"
                )
            
            return True
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notification ID"
            )
    
    async def mark_all_as_read(self, user_id: str) -> int:
        """
        Mark all notifications as read for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Count of notifications marked as read
        """
        result = await self.db.notifications.update_many(
            {
                "user_id": user_id,
                "is_read": False
            },
            {
                "$set": {
                    "is_read": True,
                    "read_at": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count
    
    async def check_and_send_deadline_warnings(self):
        """
        Check for approaching deadlines and send warnings.
        This should be called by a scheduled task (e.g., every hour).
        """
        # Find all assignments with deadlines in the next 24 hours that haven't been completed
        warning_threshold = datetime.utcnow() + timedelta(hours=24)
        
        cursor = self.db.stage_assignments.find({
            "status": {"$in": ["assigned", "in_progress"]},
            "deadline": {
                "$lte": warning_threshold,
                "$gte": datetime.utcnow()
            }
        })
        
        async for assignment in cursor:
            # Check if we've already sent a warning for this assignment
            existing_warning = await self.db.notifications.find_one({
                "user_id": assignment["assigned_to"],
                "application_id": assignment["application_id"],
                "stage_number": assignment["stage_number"],
                "type": "deadline_warning",
                "created_at": {"$gte": datetime.utcnow() - timedelta(hours=12)}
            })
            
            if not existing_warning:
                # Get application and job details
                try:
                    application = await self.db.applications.find_one(
                        {"_id": ObjectId(assignment["application_id"])}
                    )
                    
                    if application:
                        job = await self.db.jobs.find_one({"_id": ObjectId(application["job_id"])})
                        
                        await self.send_deadline_warning_notification(
                            user_id=assignment["assigned_to"],
                            application_id=assignment["application_id"],
                            stage_number=assignment["stage_number"],
                            candidate_name=application.get("name", "Unknown"),
                            job_title=job.get("title") if job else "Unknown Job",
                            deadline=assignment["deadline"]
                        )
                except Exception as e:
                    logger.error(f"Error sending deadline warning: {e}")
    
    def _get_stage_name(self, stage_number: int) -> str:
        """Get the name of a stage by its number."""
        stage_names = {
            1: "HR Screening",
            2: "Practical Lab Test",
            3: "Technical Interview",
            4: "HR Round",
            5: "BU Lead Interview",
            6: "CEO Interview",
            7: "Final Recommendation & Offer"
        }
        return stage_names.get(stage_number, f"Stage {stage_number}")
