from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from ..database import get_database
from ..models.application import StageAssignmentModel, StageAssignmentRequestModel
from ..models.user import UserRole
from fastapi import HTTPException, status
from .notification_service import NotificationService


class AssignmentService:
    """Service for managing stage assignments."""
    
    def __init__(self):
        self.db = get_database()
        self.notification_service = NotificationService()

    async def assign_stage(
        self,
        application_id: str,
        stage_number: int,
        assigned_to: str,
        assigned_by: str,
        deadline: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> StageAssignmentModel:
        """
        Assign a stage to a team member.
        
        Args:
            application_id: ID of the application
            stage_number: Stage number (1-7)
            assigned_to: User ID of team member to assign
            assigned_by: User ID of admin making the assignment
            deadline: Optional deadline for completion
            notes: Optional notes about the assignment
            
        Returns:
            StageAssignmentModel: Created assignment record
            
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
        
        # Check if stage is in pending status
        stage_status_field = f"stage{stage_number}_status"
        current_status = application.get("stages", {}).get(stage_status_field, "pending")
        
        if current_status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stage {stage_number} is not in pending status. Current status: {current_status}"
            )
        
        # Validate team member exists and has appropriate role
        try:
            team_member = await self.db.users.find_one({"_id": ObjectId(assigned_to)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid team member ID"
            )
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found"
            )
        
        # Check if team member has appropriate role
        team_member_role = team_member.get("role")
        if team_member_role not in [UserRole.TEAM_MEMBER.value, UserRole.HR.value, UserRole.ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User must have team_member, hr, or admin role to be assigned"
            )
        
        # Check for existing assignment (prevent duplicate assignments)
        stage_assigned_to_field = f"stage{stage_number}_assigned_to"
        existing_assignment = application.get("stages", {}).get(stage_assigned_to_field)
        
        if existing_assignment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stage {stage_number} is already assigned to another team member"
            )
        
        # Create assignment record in audit trail
        assignment_data = StageAssignmentModel(
            application_id=application_id,
            stage_number=stage_number,
            assigned_to=assigned_to,
            assigned_by=assigned_by,
            assigned_at=datetime.utcnow(),
            status="assigned",
            deadline=deadline,
            notes=notes
        )
        
        assignment_dict = assignment_data.dict()
        result = await self.db.stage_assignments.insert_one(assignment_dict)
        assignment_dict["_id"] = result.inserted_id
        
        # Update application document
        update_fields = {
            f"stages.{stage_assigned_to_field}": assigned_to,
            f"stages.{stage_status_field}": "assigned",
            "updated_at": datetime.utcnow()
        }
        
        # Add deadline to application stages if provided
        if deadline:
            stage_deadline_field = f"stage{stage_number}_deadline"
            update_fields[f"stages.{stage_deadline_field}"] = deadline
        
        await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_fields}
        )
        
        # Send notification to assigned team member
        try:
            # Get assigned_by user details
            assigned_by_user = await self.db.users.find_one({"_id": ObjectId(assigned_by)})
            assigned_by_name = assigned_by_user.get("username", "Admin") if assigned_by_user else "Admin"
            
            # Get job details
            job = await self.db.jobs.find_one({"_id": ObjectId(application["job_id"])})
            job_title = job.get("title", "Unknown Job") if job else "Unknown Job"
            
            await self.notification_service.send_assignment_notification(
                user_id=assigned_to,
                application_id=application_id,
                stage_number=stage_number,
                assigned_by_name=assigned_by_name,
                candidate_name=application.get("name", "Unknown"),
                job_title=job_title
            )
        except Exception as e:
            # Log error but don't fail the assignment
            import logging
            logging.error(f"Failed to send assignment notification: {e}")
        
        return assignment_data

    async def get_my_assignments(self, user_id: str) -> List[dict]:
        """
        Get all assignments for a specific team member.
        
        Args:
            user_id: User ID of the team member
            
        Returns:
            List of assignments with application details
        """
        # Find all applications where user is assigned to any stage
        assignments = []
        
        # Query for each stage
        for stage_num in range(1, 8):
            stage_assigned_field = f"stages.stage{stage_num}_assigned_to"
            stage_status_field = f"stages.stage{stage_num}_status"
            
            cursor = self.db.applications.find({stage_assigned_field: user_id})
            
            async for application in cursor:
                application_id = str(application["_id"])
                stage_status = application.get("stages", {}).get(f"stage{stage_num}_status", "pending")
                
                # Get job details
                job = await self.db.jobs.find_one({"_id": ObjectId(application["job_id"])})
                job_title = job.get("title", "Unknown Job") if job else "Unknown Job"
                
                # Get assignment details from audit trail
                assignment_record = await self.db.stage_assignments.find_one({
                    "application_id": application_id,
                    "stage_number": stage_num,
                    "assigned_to": user_id
                })
                
                assignment_info = {
                    "id": application_id,
                    "application_id": application_id,
                    "candidate_name": application.get("name"),
                    "candidate_email": application.get("email"),
                    "job_id": application.get("job_id"),
                    "job_title": job_title,
                    "stage_number": stage_num,
                    "stage_name": self._get_stage_name(stage_num),
                    "status": stage_status,
                    "assigned_at": assignment_record.get("assigned_at") if assignment_record else None,
                    "deadline": assignment_record.get("deadline") if assignment_record else None,
                    "notes": assignment_record.get("notes") if assignment_record else None
                }
                
                assignments.append(assignment_info)
        
        # Sort by assigned_at (most recent first)
        assignments.sort(key=lambda x: x.get("assigned_at") or datetime.min, reverse=True)
        
        return assignments

    async def reassign_stage(
        self,
        application_id: str,
        stage_number: int,
        new_assigned_to: str,
        assigned_by: str,
        reason: str
    ) -> StageAssignmentModel:
        """
        Reassign a stage to a different team member.
        
        Args:
            application_id: ID of the application
            stage_number: Stage number (1-7)
            new_assigned_to: User ID of new team member
            assigned_by: User ID of admin making the reassignment
            reason: Reason for reassignment
            
        Returns:
            StageAssignmentModel: New assignment record
            
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
        
        # Check if stage is not completed
        stage_status_field = f"stage{stage_number}_status"
        current_status = application.get("stages", {}).get(stage_status_field, "pending")
        
        if current_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reassign completed stage {stage_number}"
            )
        
        # Get current assignment
        stage_assigned_to_field = f"stage{stage_number}_assigned_to"
        old_assigned_to = application.get("stages", {}).get(stage_assigned_to_field)
        
        if not old_assigned_to:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stage {stage_number} is not currently assigned"
            )
        
        # Validate new team member exists
        try:
            team_member = await self.db.users.find_one({"_id": ObjectId(new_assigned_to)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid team member ID"
            )
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found"
            )
        
        # Check if team member has appropriate role
        team_member_role = team_member.get("role")
        if team_member_role not in [UserRole.TEAM_MEMBER.value, UserRole.HR.value, UserRole.ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User must have team_member, hr, or admin role to be assigned"
            )
        
        # Create new assignment record with reassignment info
        assignment_data = StageAssignmentModel(
            application_id=application_id,
            stage_number=stage_number,
            assigned_to=new_assigned_to,
            assigned_by=assigned_by,
            assigned_at=datetime.utcnow(),
            status="assigned",
            reassigned_from=old_assigned_to,
            reassignment_reason=reason
        )
        
        assignment_dict = assignment_data.dict()
        await self.db.stage_assignments.insert_one(assignment_dict)
        
        # Update application document
        update_fields = {
            f"stages.{stage_assigned_to_field}": new_assigned_to,
            f"stages.{stage_status_field}": "assigned",
            "updated_at": datetime.utcnow()
        }
        
        await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_fields}
        )
        
        # Send notifications to both old and new assignees
        try:
            # Get assigned_by user details
            assigned_by_user = await self.db.users.find_one({"_id": ObjectId(assigned_by)})
            assigned_by_name = assigned_by_user.get("username", "Admin") if assigned_by_user else "Admin"
            
            # Get job details
            job = await self.db.jobs.find_one({"_id": ObjectId(application["job_id"])})
            job_title = job.get("title", "Unknown Job") if job else "Unknown Job"
            
            await self.notification_service.send_reassignment_notification(
                old_user_id=old_assigned_to,
                new_user_id=new_assigned_to,
                application_id=application_id,
                stage_number=stage_number,
                assigned_by_name=assigned_by_name,
                candidate_name=application.get("name", "Unknown"),
                job_title=job_title,
                reason=reason
            )
        except Exception as e:
            # Log error but don't fail the reassignment
            import logging
            logging.error(f"Failed to send reassignment notifications: {e}")
        
        return assignment_data

    async def get_stage_assignments(self, application_id: str) -> List[dict]:
        """
        Get all assignment history for an application (audit trail).
        
        Args:
            application_id: ID of the application
            
        Returns:
            List of assignment records with user details
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
        
        # Get all assignment records for this application
        cursor = self.db.stage_assignments.find({"application_id": application_id})
        assignments = []
        
        async for assignment in cursor:
            assignment["id"] = str(assignment["_id"])
            del assignment["_id"]
            
            # Get assigned_to user details
            assigned_to_user = await self.db.users.find_one({"_id": ObjectId(assignment["assigned_to"])})
            if assigned_to_user:
                assignment["assigned_to_name"] = assigned_to_user.get("username")
                assignment["assigned_to_email"] = assigned_to_user.get("email")
            
            # Get assigned_by user details
            assigned_by_user = await self.db.users.find_one({"_id": ObjectId(assignment["assigned_by"])})
            if assigned_by_user:
                assignment["assigned_by_name"] = assigned_by_user.get("username")
                assignment["assigned_by_email"] = assigned_by_user.get("email")
            
            # Get reassigned_from user details if applicable
            if assignment.get("reassigned_from"):
                reassigned_from_user = await self.db.users.find_one({"_id": ObjectId(assignment["reassigned_from"])})
                if reassigned_from_user:
                    assignment["reassigned_from_name"] = reassigned_from_user.get("username")
            
            assignment["stage_name"] = self._get_stage_name(assignment["stage_number"])
            
            # Get feedback submission timestamp if stage is completed
            if assignment.get("status") == "completed":
                stage_feedback_field = f"stage{assignment['stage_number']}_feedback"
                feedback = application.get("stages", {}).get(stage_feedback_field)
                if feedback:
                    assignment["feedback_submitted_at"] = feedback.get("submitted_at")
                    assignment["feedback_approval_status"] = feedback.get("approval_status")
                    assignment["feedback_rating"] = feedback.get("performance_rating")
            
            assignments.append(assignment)
        
        # Sort by assigned_at (most recent first)
        assignments.sort(key=lambda x: x.get("assigned_at", datetime.min), reverse=True)
        
        return assignments
    
    async def record_status_change(
        self,
        application_id: str,
        stage_number: int,
        old_status: str,
        new_status: str,
        changed_by: str
    ):
        """
        Record a status change in the audit trail.
        
        Args:
            application_id: ID of the application
            stage_number: Stage number (1-7)
            old_status: Previous status
            new_status: New status
            changed_by: User ID who made the change
        """
        # Update the assignment record with status change
        await self.db.stage_assignments.update_one(
            {
                "application_id": application_id,
                "stage_number": stage_number,
                "status": old_status
            },
            {
                "$set": {
                    "status": new_status,
                    "status_changed_at": datetime.utcnow(),
                    "status_changed_by": changed_by
                }
            }
        )

    async def bulk_assign_stages(
        self,
        application_id: str,
        stage_numbers: List[int],
        assigned_to: str,
        assigned_by: str,
        deadline: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> dict:
        """
        Assign multiple stages to the same team member at once.
        
        Args:
            application_id: ID of the application
            stage_numbers: List of stage numbers (1-7) to assign
            assigned_to: User ID of team member to assign
            assigned_by: User ID of admin making the assignment
            deadline: Optional deadline for completion (applies to all stages)
            notes: Optional notes about the assignment (applies to all stages)
            
        Returns:
            dict: Summary of assignments with success count and any errors
            
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
        
        # Validate stage numbers
        if not stage_numbers or len(stage_numbers) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one stage must be selected"
            )
        
        for stage_number in stage_numbers:
            if stage_number < 1 or stage_number > 7:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stage number {stage_number} must be between 1 and 7"
                )
        
        # Validate team member exists and has appropriate role
        try:
            team_member = await self.db.users.find_one({"_id": ObjectId(assigned_to)})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid team member ID"
            )
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found"
            )
        
        # Check if team member has appropriate role
        team_member_role = team_member.get("role")
        if team_member_role not in [UserRole.TEAM_MEMBER.value, UserRole.HR.value, UserRole.ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User must have team_member, hr, or admin role to be assigned"
            )
        
        # Validate all selected stages are in pending status
        invalid_stages = []
        for stage_number in stage_numbers:
            stage_status_field = f"stage{stage_number}_status"
            current_status = application.get("stages", {}).get(stage_status_field, "pending")
            
            if current_status != "pending":
                invalid_stages.append({
                    "stage_number": stage_number,
                    "current_status": current_status
                })
        
        if invalid_stages:
            error_details = ", ".join([
                f"Stage {s['stage_number']} ({s['current_status']})" 
                for s in invalid_stages
            ])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"All selected stages must be in pending status. Invalid stages: {error_details}"
            )
        
        # Create assignments for all selected stages
        successful_assignments = []
        failed_assignments = []
        
        for stage_number in stage_numbers:
            try:
                # Create assignment record in audit trail
                assignment_data = StageAssignmentModel(
                    application_id=application_id,
                    stage_number=stage_number,
                    assigned_to=assigned_to,
                    assigned_by=assigned_by,
                    assigned_at=datetime.utcnow(),
                    status="assigned",
                    deadline=deadline,
                    notes=notes
                )
                
                assignment_dict = assignment_data.dict()
                result = await self.db.stage_assignments.insert_one(assignment_dict)
                assignment_dict["_id"] = result.inserted_id
                
                # Update application document
                stage_assigned_to_field = f"stage{stage_number}_assigned_to"
                stage_status_field = f"stage{stage_number}_status"
                
                update_fields = {
                    f"stages.{stage_assigned_to_field}": assigned_to,
                    f"stages.{stage_status_field}": "assigned",
                    "updated_at": datetime.utcnow()
                }
                
                # Add deadline to application stages if provided
                if deadline:
                    stage_deadline_field = f"stage{stage_number}_deadline"
                    update_fields[f"stages.{stage_deadline_field}"] = deadline
                
                await self.db.applications.update_one(
                    {"_id": ObjectId(application_id)},
                    {"$set": update_fields}
                )
                
                successful_assignments.append({
                    "stage_number": stage_number,
                    "stage_name": self._get_stage_name(stage_number)
                })
                
            except Exception as e:
                failed_assignments.append({
                    "stage_number": stage_number,
                    "stage_name": self._get_stage_name(stage_number),
                    "error": str(e)
                })
        
        # Send notification to assigned team member for all successful assignments
        if successful_assignments:
            try:
                # Get assigned_by user details
                assigned_by_user = await self.db.users.find_one({"_id": ObjectId(assigned_by)})
                assigned_by_name = assigned_by_user.get("username", "Admin") if assigned_by_user else "Admin"
                
                # Get job details
                job = await self.db.jobs.find_one({"_id": ObjectId(application["job_id"])})
                job_title = job.get("title", "Unknown Job") if job else "Unknown Job"
                
                # Send a single notification for bulk assignment
                stage_list = ", ".join([f"Stage {a['stage_number']}" for a in successful_assignments])
                await self.notification_service.send_bulk_assignment_notification(
                    user_id=assigned_to,
                    application_id=application_id,
                    stage_count=len(successful_assignments),
                    stage_list=stage_list,
                    assigned_by_name=assigned_by_name,
                    candidate_name=application.get("name", "Unknown"),
                    job_title=job_title
                )
            except Exception as e:
                # Log error but don't fail the assignment
                import logging
                logging.error(f"Failed to send bulk assignment notification: {e}")
        
        return {
            "success_count": len(successful_assignments),
            "failed_count": len(failed_assignments),
            "successful_assignments": successful_assignments,
            "failed_assignments": failed_assignments,
            "total_requested": len(stage_numbers)
        }

    def _get_stage_name(self, stage_number: int) -> str:
        """Get the name of a stage by its number."""
        stage_names = {
            1: "Resume Screening",
            2: "HR Telephonic Interview",
            3: "Practical Lab Test",
            4: "Technical Interview",
            5: "BU Lead Round",
            6: "HR Head Round",
            7: "CEO Round"
        }
        return stage_names.get(stage_number, f"Stage {stage_number}")
