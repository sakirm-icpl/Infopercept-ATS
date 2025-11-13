from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from ..database import get_database
from ..models.application import (
    ApplicationCreate, ApplicationInDB, ApplicationResponse, 
    ApplicationListResponse, ApplicationStages, HRScreening,
    PracticalLabTest, TechnicalInterview, HRRound, 
    BULeadInterview, CEOInterview, FinalRecommendationOffer,
    StageAssignmentRequest, StageAssignmentResponse
)
from ..models.user import UserRole
from fastapi import HTTPException, status


class ApplicationService:
    def __init__(self):
        self.db = get_database()

    async def create_application(self, application_data: ApplicationCreate, candidate_id: str) -> ApplicationResponse:
        """Create a new application for a candidate."""
        # Check if candidate already has an application for this specific job
        existing_application = await self.db.applications.find_one({
            "candidate_id": candidate_id,
            "job_id": application_data.job_id
        })
        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Candidate already has an application for this job"
            )
        
        # Check if email already exists in applications for this job
        existing_email = await self.db.applications.find_one({
            "email": application_data.email,
            "job_id": application_data.job_id
        })
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already has an application for this job"
            )
        
        # Create application document
        application_dict = application_data.dict()
        application_dict["candidate_id"] = candidate_id
        
        application_in_db = ApplicationInDB(**application_dict)
        application_doc = application_in_db.dict()
        
        # Insert into database
        result = await self.db.applications.insert_one(application_doc)
        application_doc["id"] = str(result.inserted_id)
        del application_doc["_id"]
        
        # Update job applications count
        from .job_service import JobService
        job_service = JobService()
        await job_service.update_applications_count(application_data.job_id, increment=True)
        
        return ApplicationResponse(**application_doc)

    async def get_application_by_id(self, application_id: str) -> Optional[ApplicationResponse]:
        """Get application by ID."""
        try:
            application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
            if not application:
                return None
            
            application["id"] = str(application["_id"])
            del application["_id"]
            
            return ApplicationResponse(**application)
        except Exception:
            return None

    async def get_application_by_candidate_id(self, candidate_id: str) -> Optional[ApplicationResponse]:
        """Get application by candidate ID."""
        application = await self.db.applications.find_one({"candidate_id": candidate_id})
        if not application:
            return None
        
        application["id"] = str(application["_id"])
        del application["_id"]
        
        return ApplicationResponse(**application)

    async def get_all_applications(self, user_role: UserRole, user_id: str = None) -> List[ApplicationListResponse]:
        """Get applications based on user role."""
        applications = []
        
        if user_role == UserRole.CANDIDATE:
            # Candidates can only see their own applications
            if user_id:
                cursor = self.db.applications.find({"candidate_id": user_id})
                async for application in cursor:
                    application["id"] = str(application["_id"])
                    del application["_id"]
                    
                    # Get job title for the application
                    from .job_service import JobService
                    job_service = JobService()
                    job = await job_service.get_job_by_id(application["job_id"])
                    if job:
                        application["job_title"] = job.title
                    else:
                        application["job_title"] = "Unknown Job"
                    
                    applications.append(ApplicationListResponse(**application))
        else:
            # HR and Admin can see all applications
            cursor = self.db.applications.find({})
            async for application in cursor:
                application["id"] = str(application["_id"])
                del application["_id"]
                
                # Get job title for the application
                from .job_service import JobService
                job_service = JobService()
                job = await job_service.get_job_by_id(application["job_id"])
                if job:
                    application["job_title"] = job.title
                else:
                    application["job_title"] = "Unknown Job"
                
                applications.append(ApplicationListResponse(**application))
        
        return applications

    async def update_stage_feedback(self, application_id: str, stage: int, stage_data: dict) -> ApplicationResponse:
        """Update feedback for a specific interview stage."""
        try:
            application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
            if not application:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Application not found"
                )
            
            # Validate stage number
            if stage < 1 or stage > 6:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid stage number. Must be between 1 and 6."
                )
            
            # Update the specific stage
            stage_field = f"stages.stage{stage}"
            
            # Add completion timestamp
            stage_data["completed_at"] = datetime.utcnow()
            
            # Update the application
            result = await self.db.applications.update_one(
                {"_id": ObjectId(application_id)},
                {
                    "$set": {
                        stage_field: stage_data,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to update stage feedback"
                )
            
            return await self.get_application_by_id(application_id)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def update_final_recommendation(self, application_id: str, recommendation_data: dict) -> ApplicationResponse:
        """Update final recommendation for an application."""
        try:
            application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
            if not application:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Application not found"
                )
            
            # Add completion timestamp
            recommendation_data["completed_at"] = datetime.utcnow()
            
            # Update the application
            result = await self.db.applications.update_one(
                {"_id": ObjectId(application_id)},
                {
                    "$set": {
                        "stages.stage7_final_recommendation": recommendation_data,
                        "status": "completed",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to update final recommendation"
                )
            
            return await self.get_application_by_id(application_id)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def delete_application(self, application_id: str):
        """Delete an application."""
        result = await self.db.applications.delete_one({"_id": ObjectId(application_id)})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )

    async def get_applications_by_job(self, job_id: str) -> List[ApplicationListResponse]:
        """Get all applications for a specific job."""
        applications = []
        cursor = self.db.applications.find({"job_id": job_id})
        async for application in cursor:
            application["id"] = str(application["_id"])
            del application["_id"]
            
            # Get job title for the application
            from .job_service import JobService
            job_service = JobService()
            job = await job_service.get_job_by_id(application["job_id"])
            if job:
                application["job_title"] = job.title
            else:
                application["job_title"] = "Unknown Job"
            
            applications.append(ApplicationListResponse(**application))
        
        return applications

    async def update_application_status(self, application_id: str, status: str) -> ApplicationResponse:
        """Update application status."""
        result = await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return await self.get_application_by_id(application_id)

    async def forward_stage_to_hr(self, application_id: str, stage_number: int, user_id: str) -> ApplicationResponse:
        """Forward a completed stage to HR for review."""
        # Verify application exists
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check if current stage is completed
        stage_status_field = f"stage{stage_number}_status"
        if application.get("stages", {}).get(stage_status_field) != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stage {stage_number} must be completed before forwarding"
            )
        
        # Update stage status to "forwarded"
        result = await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {
                "$set": {
                    stage_status_field: "forwarded",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to forward stage"
            )
        
        return await self.get_application_by_id(application_id)

    async def approve_stage_by_hr(self, application_id: str, stage_number: int, user_id: str) -> ApplicationResponse:
        """Approve a forwarded stage and move to next stage."""
        # Verify application exists
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check if current stage is forwarded
        stage_status_field = f"stage{stage_number}_status"
        if application.get("stages", {}).get(stage_status_field) != "forwarded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stage {stage_number} must be forwarded before approval"
            )
        
        # Move to next stage
        current_stage = application.get("current_stage", 1)
        next_stage = current_stage + 1
        
        # Update application
        updates = {
            stage_status_field: "approved",
            "current_stage": next_stage,
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": updates}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to approve stage"
            )
        
        return await self.get_application_by_id(application_id)

    async def reject_stage_by_hr(self, application_id: str, stage_number: int, reason: str, user_id: str) -> ApplicationResponse:
        """Reject a forwarded stage and provide reason."""
        # Verify application exists
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check if current stage is forwarded
        stage_status_field = f"stage{stage_number}_status"
        if application.get("stages", {}).get(stage_status_field) != "forwarded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stage {stage_number} must be forwarded before rejection"
            )
        
        # Update application
        updates = {
            stage_status_field: "rejected",
            "status": "rejected",
            "updated_at": datetime.utcnow()
        }
        
        # Add rejection reason
        rejection_field = f"stage{stage_number}_rejection_reason"
        updates[rejection_field] = reason
        
        result = await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": updates}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to reject stage"
            )
        
        return await self.get_application_by_id(application_id)

    async def get_all_interviewers_for_assignment(self) -> List[dict]:
        """Get all users available for assignment (HR, Admin, Team Members - excluding candidates)."""
        try:
            users = await self.db.users.find({
                "role": {"$in": ["hr", "admin", "team_member", "requester"]}
            }).to_list(length=None)
            
            user_responses = []
            for user in users:
                user["id"] = str(user["_id"])
                del user["_id"]
                user_responses.append(user)
            
            return user_responses
        except Exception:
            return []