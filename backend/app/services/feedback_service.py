from typing import Optional
from datetime import datetime, timedelta
from bson import ObjectId
from ..database import get_database
from ..models.application import StageFeedback, FeedbackSubmission
from ..models.user import UserRole
from fastapi import HTTPException, status


class FeedbackService:
    """Service for managing stage feedback."""
    
    def __init__(self):
        self.db = get_database()
        self.edit_window_minutes = 30  # 30 minutes edit window
        self.max_edits = 3  # Maximum 3 edits allowed

    async def submit_feedback(
        self,
        application_id: str,
        stage_number: int,
        feedback: FeedbackSubmission,
        submitted_by: str
    ) -> dict:
        """
        Submit feedback for an assigned stage.
        
        Args:
            application_id: ID of the application
            stage_number: Stage number (1-7)
            feedback: Feedback data (approval_status, performance_rating, comments)
            submitted_by: User ID of the team member submitting feedback
            
        Returns:
            dict: Updated application with feedback
            
        Raises:
            HTTPException: If validation fails
        """
        # Validate application exists
        try:
            application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid application ID"
            )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Validate stage number
        if stage_number < 1 or stage_number > 7:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stage number must be between 1 and 7"
            )
        
        # Verify user is assigned to this stage or is HR/Admin
        # Get user to check role
        user = await self.db.users.find_one({"_id": ObjectId(submitted_by)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_role = user.get("role")
        
        # HR and Admin can submit feedback for any stage
        # Team members can only submit for stages assigned to them
        if user_role not in ["hr", "admin"]:
            stage_assigned_to_field = f"stage{stage_number}_assigned_to"
            assigned_to = application.get("stages", {}).get(stage_assigned_to_field)
            
            if assigned_to != submitted_by:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not assigned to this stage. Only assigned team members can submit feedback."
                )
        
        # Check if feedback already exists (for edit validation)
        stage_feedback_field = f"stage{stage_number}_feedback"
        existing_feedback = application.get("stages", {}).get(stage_feedback_field)
        
        if existing_feedback:
            # This is an edit
            # HR and Admin can edit without restrictions
            # Team members must be within edit window and edit count
            if user_role not in ["hr", "admin"]:
                if not await self.can_edit_feedback(application_id, stage_number, submitted_by):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Edit window expired or maximum edits reached"
                    )
            
            # Increment edit count
            edit_count = existing_feedback.get("edit_count", 0) + 1
            edited_at = datetime.utcnow()
            
            # Create updated feedback
            feedback_data = StageFeedback(
                approval_status=feedback.approval_status,
                performance_rating=feedback.performance_rating,
                comments=feedback.comments,
                submitted_by=submitted_by,
                submitted_at=existing_feedback.get("submitted_at", datetime.utcnow()),
                edited_at=edited_at,
                edit_count=edit_count
            )
        else:
            # This is a new submission
            feedback_data = StageFeedback(
                approval_status=feedback.approval_status,
                performance_rating=feedback.performance_rating,
                comments=feedback.comments,
                submitted_by=submitted_by,
                submitted_at=datetime.utcnow(),
                edited_at=None,
                edit_count=0
            )
        
        # Update application document with feedback
        stage_status_field = f"stage{stage_number}_status"
        update_fields = {
            f"stages.{stage_feedback_field}": feedback_data.dict(),
            f"stages.{stage_status_field}": "completed",
            "updated_at": datetime.utcnow()
        }
        
        await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_fields}
        )
        
        # Update assignment record status to completed
        await self.db.stage_assignments.update_one(
            {
                "application_id": application_id,
                "stage_number": stage_number,
                "assigned_to": submitted_by
            },
            {
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.utcnow()
                }
            }
        )
        
        # Get updated application
        updated_application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        updated_application["id"] = str(updated_application["_id"])
        del updated_application["_id"]
        
        return updated_application

    async def get_feedback(
        self,
        application_id: str,
        stage_number: int,
        user_id: str,
        user_role: str
    ) -> dict:
        """
        Get feedback for a specific stage.
        
        Args:
            application_id: ID of the application
            stage_number: Stage number (1-7)
            user_id: User ID requesting the feedback
            user_role: Role of the user (admin, team_member, etc.)
            
        Returns:
            dict: Feedback data with submitter details
            
        Raises:
            HTTPException: If validation fails or access denied
        """
        # Validate application exists
        try:
            application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid application ID"
            )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Validate stage number
        if stage_number < 1 or stage_number > 7:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stage number must be between 1 and 7"
            )
        
        # Check access permissions
        stage_assigned_to_field = f"stage{stage_number}_assigned_to"
        assigned_to = application.get("stages", {}).get(stage_assigned_to_field)
        
        # Admin can view all feedback, team members can only view their own
        if user_role != UserRole.ADMIN.value and assigned_to != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this feedback"
            )
        
        # Get feedback
        stage_feedback_field = f"stage{stage_number}_feedback"
        feedback = application.get("stages", {}).get(stage_feedback_field)
        
        if not feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found for this stage"
            )
        
        # Get submitter details
        submitter_id = feedback.get("submitted_by")
        submitter = await self.db.users.find_one({"_id": ObjectId(submitter_id)})
        
        if submitter:
            feedback["submitted_by_name"] = submitter.get("username")
            feedback["submitted_by_email"] = submitter.get("email")
        
        # Add stage information
        feedback["stage_number"] = stage_number
        feedback["application_id"] = application_id
        
        # Check if user can edit
        # HR and Admin can always edit any feedback
        # Team members can edit their own feedback within restrictions
        can_edit = False
        if user_role in [UserRole.ADMIN.value, UserRole.HR.value]:
            can_edit = True
        elif assigned_to == user_id:
            can_edit = await self.can_edit_feedback(application_id, stage_number, user_id)
        
        feedback["can_edit"] = can_edit
        
        return feedback

    async def can_edit_feedback(
        self,
        application_id: str,
        stage_number: int,
        user_id: str
    ) -> bool:
        """
        Check if a user can edit feedback within the edit window.
        HR and Admin users can always edit any feedback.
        Team members can edit their own feedback within time and count restrictions.
        
        Args:
            application_id: ID of the application
            stage_number: Stage number (1-7)
            user_id: User ID to check
            
        Returns:
            bool: True if user can edit, False otherwise
        """
        try:
            # Check if user is HR or Admin - they can always edit
            user = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if user and user.get("role") in ["hr", "admin"]:
                return True
            
            application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
            if not application:
                return False
            
            # Check if user submitted the feedback
            stage_feedback_field = f"stage{stage_number}_feedback"
            feedback = application.get("stages", {}).get(stage_feedback_field)
            
            if not feedback:
                return False
            
            submitted_by = feedback.get("submitted_by")
            if submitted_by != user_id:
                return False
            
            # Check edit count
            edit_count = feedback.get("edit_count", 0)
            if edit_count >= self.max_edits:
                return False
            
            # Check edit window (30 minutes from submission)
            submitted_at = feedback.get("submitted_at")
            if not submitted_at:
                return False
            
            # Convert to datetime if it's a string
            if isinstance(submitted_at, str):
                submitted_at = datetime.fromisoformat(submitted_at.replace('Z', '+00:00'))
            
            edit_deadline = submitted_at + timedelta(minutes=self.edit_window_minutes)
            current_time = datetime.utcnow()
            
            return current_time <= edit_deadline
            
        except Exception:
            return False

    async def update_stage_status(
        self,
        application_id: str,
        stage_number: int,
        status: str,
        user_id: str
    ) -> dict:
        """
        Update the status of a stage.
        
        Args:
            application_id: ID of the application
            stage_number: Stage number (1-7)
            status: New status (assigned, in_progress, completed)
            user_id: User ID making the update
            
        Returns:
            dict: Updated application
            
        Raises:
            HTTPException: If validation fails
        """
        # Validate application exists
        try:
            application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid application ID"
            )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Validate stage number
        if stage_number < 1 or stage_number > 7:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stage number must be between 1 and 7"
            )
        
        # Validate status value
        valid_statuses = ["pending", "assigned", "in_progress", "completed"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Verify user is assigned to this stage
        stage_assigned_to_field = f"stage{stage_number}_assigned_to"
        assigned_to = application.get("stages", {}).get(stage_assigned_to_field)
        
        if assigned_to != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this stage"
            )
        
        # Validate status transitions
        stage_status_field = f"stage{stage_number}_status"
        current_status = application.get("stages", {}).get(stage_status_field, "pending")
        
        # Define valid transitions
        valid_transitions = {
            "pending": ["assigned"],
            "assigned": ["in_progress"],
            "in_progress": ["completed"],
            "completed": []  # Cannot transition from completed
        }
        
        if status not in valid_transitions.get(current_status, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from {current_status} to {status}"
            )
        
        # Update stage status
        update_fields = {
            f"stages.{stage_status_field}": status,
            "updated_at": datetime.utcnow()
        }
        
        await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_fields}
        )
        
        # Update assignment record status
        await self.db.stage_assignments.update_one(
            {
                "application_id": application_id,
                "stage_number": stage_number,
                "assigned_to": user_id
            },
            {"$set": {"status": status}}
        )
        
        # Get updated application
        updated_application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        updated_application["id"] = str(updated_application["_id"])
        del updated_application["_id"]
        
        return updated_application


    async def get_feedback_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """
        Get comprehensive feedback statistics across all applications.
        
        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            
        Returns:
            dict: Statistics including rating distribution, team member performance, etc.
        """
        # Build query filter
        query_filter = {}
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            
            # We need to check if any stage feedback was submitted in the date range
            # This is complex, so we'll fetch all and filter in Python
            pass
        
        # Fetch all applications with feedback
        applications = await self.db.applications.find(query_filter).to_list(length=None)
        
        # Initialize statistics
        total_feedback = 0
        approved_count = 0
        rejected_count = 0
        total_rating = 0
        rating_distribution = {i: 0 for i in range(1, 11)}  # 1-10
        stage_ratings = {i: {"total": 0, "count": 0, "avg": 0} for i in range(1, 8)}  # 7 stages
        team_member_stats = {}
        
        # Process each application
        for application in applications:
            stages = application.get("stages", {})
            
            # Check each stage for feedback
            for stage_num in range(1, 8):
                feedback_field = f"stage{stage_num}_feedback"
                feedback = stages.get(feedback_field)
                
                if feedback:
                    # Apply date filter if specified
                    submitted_at = feedback.get("submitted_at")
                    if submitted_at:
                        if isinstance(submitted_at, str):
                            submitted_at = datetime.fromisoformat(submitted_at.replace('Z', '+00:00'))
                        
                        # Skip if outside date range
                        if start_date and submitted_at < start_date:
                            continue
                        if end_date and submitted_at > end_date:
                            continue
                    
                    # Count total feedback
                    total_feedback += 1
                    
                    # Count approval status
                    approval_status = feedback.get("approval_status")
                    if approval_status == "Approved":
                        approved_count += 1
                    elif approval_status == "Rejected":
                        rejected_count += 1
                    
                    # Rating statistics
                    rating = feedback.get("performance_rating", 0)
                    total_rating += rating
                    
                    # Rating distribution
                    if 1 <= rating <= 10:
                        rating_distribution[rating] += 1
                    
                    # Stage-specific ratings
                    stage_ratings[stage_num]["total"] += rating
                    stage_ratings[stage_num]["count"] += 1
                    
                    # Team member statistics
                    submitted_by = feedback.get("submitted_by")
                    if submitted_by:
                        if submitted_by not in team_member_stats:
                            team_member_stats[submitted_by] = {
                                "total_feedback": 0,
                                "approved": 0,
                                "rejected": 0,
                                "total_rating": 0,
                                "avg_rating": 0
                            }
                        
                        team_member_stats[submitted_by]["total_feedback"] += 1
                        team_member_stats[submitted_by]["total_rating"] += rating
                        
                        if approval_status == "Approved":
                            team_member_stats[submitted_by]["approved"] += 1
                        elif approval_status == "Rejected":
                            team_member_stats[submitted_by]["rejected"] += 1
        
        # Calculate averages
        avg_rating = round(total_rating / total_feedback, 2) if total_feedback > 0 else 0
        approval_rate = round((approved_count / total_feedback) * 100, 1) if total_feedback > 0 else 0
        
        # Calculate stage averages
        for stage_num in range(1, 8):
            count = stage_ratings[stage_num]["count"]
            if count > 0:
                stage_ratings[stage_num]["avg"] = round(
                    stage_ratings[stage_num]["total"] / count, 2
                )
        
        # Calculate team member averages and fetch user details
        team_member_list = []
        for user_id, stats in team_member_stats.items():
            if stats["total_feedback"] > 0:
                stats["avg_rating"] = round(
                    stats["total_rating"] / stats["total_feedback"], 2
                )
            
            # Fetch user details
            try:
                user = await self.db.users.find_one({"_id": ObjectId(user_id)})
                if user:
                    team_member_list.append({
                        "user_id": user_id,
                        "username": user.get("username", "Unknown"),
                        "email": user.get("email", ""),
                        **stats
                    })
            except Exception:
                # Skip if user not found
                pass
        
        # Sort team members by total feedback (most active first)
        team_member_list.sort(key=lambda x: x["total_feedback"], reverse=True)
        
        # Prepare rating distribution for chart
        rating_distribution_list = [
            {"rating": rating, "count": count}
            for rating, count in rating_distribution.items()
        ]
        
        # Prepare stage ratings for chart
        stage_ratings_list = [
            {
                "stage": stage_num,
                "stage_name": self._get_stage_name(stage_num),
                "avg_rating": stage_ratings[stage_num]["avg"],
                "count": stage_ratings[stage_num]["count"]
            }
            for stage_num in range(1, 8)
        ]
        
        return {
            "summary": {
                "total_feedback": total_feedback,
                "approved_count": approved_count,
                "rejected_count": rejected_count,
                "avg_rating": avg_rating,
                "approval_rate": approval_rate
            },
            "rating_distribution": rating_distribution_list,
            "stage_ratings": stage_ratings_list,
            "team_member_performance": team_member_list
        }
    
    def _get_stage_name(self, stage_number: int) -> str:
        """Get the name of a stage by its number."""
        stages = {
            1: 'Resume Screening',
            2: 'HR Telephonic Interview',
            3: 'Practical Lab Test',
            4: 'Technical Interview',
            5: 'BU Lead Round',
            6: 'HR Head Round',
            7: 'CEO Round'
        }
        return stages.get(stage_number, f'Stage {stage_number}')
