from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from ..database import get_database
from ..models.application import (
    StageAssignmentRequest, StageAssignmentResponse, ApplicationResponse,
    HRScreening, PracticalLabTest, TechnicalInterview, HRRound, 
    BULeadInterview, CEOInterview, FinalRecommendationOffer, ApplicationStages
)
from ..models.user import UserResponse, UserRole
from ..services.user_service import UserService


class InterviewService:
    def __init__(self):
        self.db = get_database()
        self.user_service = UserService()

    async def assign_stage(
        self, 
        application_id: str, 
        assignment: StageAssignmentRequest, 
        assigned_by: str
    ) -> StageAssignmentResponse:
        """Assign a team member to a specific interview stage."""
        # Verify application exists
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Verify team member exists
        team_member = await self.user_service.get_user_by_id(assignment.assigned_to)
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid team member assigned"
            )
        
        # Create stage assignment
        assignment_doc = {
            "application_id": application_id,
            "stage_number": assignment.stage_number,
            "assigned_to": assignment.assigned_to,
            "assigned_by": assigned_by,
            "assigned_at": datetime.utcnow(),
            "notes": assignment.notes,
            "deadline": assignment.deadline,
            "status": "pending"
        }
        
        # Check if assignment already exists
        existing = await self.db.stage_assignments.find_one({
            "application_id": application_id,
            "stage_number": assignment.stage_number
        })
        
        if existing:
            # Update existing assignment
            result = await self.db.stage_assignments.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "assigned_to": assignment.assigned_to,
                    "assigned_by": assigned_by,
                    "assigned_at": datetime.utcnow(),
                    "notes": assignment.notes,
                    "deadline": assignment.deadline,
                    "status": "pending"
                }}
            )
            assignment_doc["id"] = str(existing["_id"])
        else:
            # Create new assignment
            result = await self.db.stage_assignments.insert_one(assignment_doc)
            assignment_doc["id"] = str(result.inserted_id)
        
        # Update application stages
        stage_field = f"stage{assignment.stage_number}_assigned_to"
        status_field = f"stage{assignment.stage_number}_status"
        deadline_field = f"stage{assignment.stage_number}_deadline"
        
        update_fields = {
            stage_field: assignment.assigned_to,
            status_field: "assigned",
            "updated_at": datetime.utcnow()
        }
        if assignment.deadline:
            update_fields[deadline_field] = assignment.deadline
        
        await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_fields}
        )
        
        return StageAssignmentResponse(**assignment_doc)

    async def get_stage_assignments(
        self, 
        application_id: str, 
        current_user: UserResponse
    ) -> List[StageAssignmentResponse]:
        """Get all stage assignments for an application."""
        # Verify application exists and user has access
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check access permissions
        if current_user.role == UserRole.CANDIDATE and application["candidate_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        assignments = await self.db.stage_assignments.find({
            "application_id": application_id
        }).to_list(length=None)
        
        return [StageAssignmentResponse(**{**assignment, "id": str(assignment["_id"])}) 
                for assignment in assignments]

    async def get_my_assignments(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all applications assigned to the current team member."""
        assignments = await self.db.stage_assignments.find({
            "assigned_to": user_id,
            "status": {"$in": ["pending", "assigned"]}
        }).to_list(length=None)
        
        result = []
        for assignment in assignments:
            # Get application details
            application = await self.db.applications.find_one({
                "_id": ObjectId(assignment["application_id"])
            })
            
            if application:
                # Get job details
                job = await self.db.jobs.find_one({
                    "_id": ObjectId(application["job_id"])
                })
                
                result.append({
                    "assignment_id": str(assignment["_id"]),
                    "application_id": assignment["application_id"],
                    "stage_number": assignment["stage_number"],
                    "assigned_at": assignment["assigned_at"],
                    "notes": assignment.get("notes"),
                    "status": assignment["status"],
                    "application": {
                        "id": str(application["_id"]),
                        "name": application["name"],
                        "email": application["email"],
                        "mobile": application["mobile"],
                        "current_stage": application.get("current_stage", 1),
                        "status": application.get("status", "pending")
                    },
                    "job": {
                        "id": str(job["_id"]),
                        "title": job["title"],
                        "department": job["department"]
                    } if job else None
                })
        
        return result

    async def submit_stage1_feedback(
        self, 
        application_id: str, 
        feedback: HRScreening, 
        user_id: str
    ) -> ApplicationResponse:
        """Submit HR Screening feedback."""
        return await self._submit_stage_feedback(
            application_id, 1, feedback.dict(), user_id, "stage1_hr_screening"
        )

    async def submit_stage2_feedback(
        self, 
        application_id: str, 
        feedback: PracticalLabTest, 
        user_id: str
    ) -> ApplicationResponse:
        """Submit Practical Lab Test feedback."""
        return await self._submit_stage_feedback(
            application_id, 2, feedback.dict(), user_id, "stage2_practical_lab"
        )

    async def submit_stage3_feedback(
        self, 
        application_id: str, 
        feedback: TechnicalInterview, 
        user_id: str
    ) -> ApplicationResponse:
        """Submit Technical Interview feedback."""
        return await self._submit_stage_feedback(
            application_id, 3, feedback.dict(), user_id, "stage3_technical_interview"
        )

    async def submit_stage4_feedback(
        self, 
        application_id: str, 
        feedback: HRRound, 
        user_id: str
    ) -> ApplicationResponse:
        """Submit HR Round feedback."""
        return await self._submit_stage_feedback(
            application_id, 4, feedback.dict(), user_id, "stage4_hr_round"
        )

    async def submit_stage5_feedback(
        self, 
        application_id: str, 
        feedback: BULeadInterview, 
        user_id: str
    ) -> ApplicationResponse:
        """Submit BU Lead Interview feedback."""
        return await self._submit_stage_feedback(
            application_id, 5, feedback.dict(), user_id, "stage5_bu_lead_interview"
        )

    async def submit_stage6_feedback(
        self, 
        application_id: str, 
        feedback: CEOInterview, 
        user_id: str
    ) -> ApplicationResponse:
        """Submit CEO Interview feedback."""
        return await self._submit_stage_feedback(
            application_id, 6, feedback.dict(), user_id, "stage6_ceo_interview"
        )

    async def submit_stage7_feedback(
        self, 
        application_id: str, 
        feedback: FinalRecommendationOffer, 
        user_id: str
    ) -> ApplicationResponse:
        """Submit Final Recommendation & Offer feedback."""
        feedback_dict = feedback.dict()
        feedback_dict["completed_at"] = datetime.utcnow()
        feedback_dict["submitted_by"] = user_id  # Track who submitted for blind feedback
        
        # Update application with final recommendation
        result = await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {
                "stages.stage7_final_recommendation": feedback_dict,
                "status": "completed",
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Get updated application
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        application["id"] = str(application["_id"])
        del application["_id"]
        
        return ApplicationResponse(**application)

    async def _submit_stage_feedback(
        self, 
        application_id: str, 
        stage_number: int, 
        feedback: dict, 
        user_id: str, 
        stage_field: str
    ) -> ApplicationResponse:
        """Generic method to submit stage feedback."""
        # Verify application exists
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check if user is assigned to this stage (for team members)
        current_user = await self.user_service.get_user_by_id(user_id)
        if current_user.role == UserRole.TEAM_MEMBER:
            assignment = await self.db.stage_assignments.find_one({
                "application_id": application_id,
                "stage_number": stage_number,
                "assigned_to": user_id
            })
            if not assignment:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not assigned to this stage"
                )
        
        # Add completion timestamp and submitter info
        feedback["completed_at"] = datetime.utcnow()
        feedback["submitted_by"] = user_id  # Track who submitted for blind feedback
        
        # Update application with stage feedback
        stage_status_field = f"stage{stage_number}_status"
        
        result = await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {
                f"stages.{stage_field}": feedback,
                stage_status_field: "completed",
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Update stage assignment status
        await self.db.stage_assignments.update_one(
            {
                "application_id": application_id,
                "stage_number": stage_number
            },
            {"$set": {"status": "completed"}}
        )
        
        # Get updated application
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        application["id"] = str(application["_id"])
        del application["_id"]
        
        return ApplicationResponse(**application)

    async def forward_to_next_stage(self, application_id: str, user_id: str) -> Dict[str, Any]:
        """Forward application to the next interview stage."""
        # Verify application exists
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        current_stage = application.get("current_stage", 1)
        
        # Check if current stage is completed
        stage_status_field = f"stage{current_stage}_status"
        if application.get("stages", {}).get(stage_status_field) != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stage {current_stage} must be completed before forwarding"
            )
        
        # Move to next stage
        next_stage = current_stage + 1
        if next_stage > 7:  # Updated to 7 stages
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application has completed all interview stages"
            )
        
        # Update application
        await self.db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {
                "current_stage": next_stage,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {
            "message": f"Application forwarded to stage {next_stage}",
            "current_stage": next_stage,
            "application_id": application_id
        }

    async def get_stage_status(
        self, 
        application_id: str, 
        current_user: UserResponse
    ) -> Dict[str, Any]:
        """Get the current stage status and progress for an application."""
        # Verify application exists
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check access permissions
        if current_user.role == UserRole.CANDIDATE and application["candidate_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        stages = application.get("stages", {})
        current_stage = application.get("current_stage", 1)
        
        stage_status = {}
        for i in range(1, 8):  # Updated to 7 stages
            stage_status[f"stage{i}"] = {
                "status": stages.get(f"stage{i}_status", "pending"),
                "assigned_to": stages.get(f"stage{i}_assigned_to"),
                "completed": stages.get(f"stage{i}_status") == "completed"
            }
        
        # Get final recommendation status
        final_recommendation = stages.get("stage7_final_recommendation")
        
        return {
            "application_id": application_id,
            "current_stage": current_stage,
            "overall_status": application.get("status", "pending"),
            "stage_status": stage_status,
            "final_recommendation": final_recommendation is not None,
            "total_stages": 7  # Updated to 7 stages
        }
        
    async def get_stage_feedback_for_user(
        self, 
        application_id: str, 
        stage_number: int, 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get stage feedback that the user is allowed to see based on blind feedback rules."""
        # Get application
        application = await self.db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Get user role
        user = await self.user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # For Admin and HR, they can see all feedback
        if user.role in [UserRole.ADMIN, UserRole.HR, UserRole.CEO]:
            stage_field = f"stage{stage_number}_{self._get_stage_field_name(stage_number)}"
            return application.get("stages", {}).get(stage_field)
        
        # For Team Members and Requesters, they can only see their own feedback
        if user.role in [UserRole.TEAM_MEMBER, UserRole.CANDIDATE]:
            stage_field = f"stage{stage_number}_{self._get_stage_field_name(stage_number)}"
            feedback = application.get("stages", {}).get(stage_field)
            if feedback and feedback.get("submitted_by") == user_id:
                return feedback
            # Return None if they didn't submit this feedback
            return None
        
        return None
    
    def _get_stage_field_name(self, stage_number: int) -> str:
        """Get the field name for a stage."""
        stage_fields = {
            1: "hr_screening",
            2: "practical_lab",
            3: "technical_interview",
            4: "hr_round",
            5: "bu_lead_interview",
            6: "ceo_interview",
            7: "final_recommendation"
        }
        return stage_fields.get(stage_number, "")