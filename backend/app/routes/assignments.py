from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from ..models.application import StageAssignmentRequestModel, StageAssignmentModel
from ..models.user import UserResponse, UserRole
from ..services.assignment_service import AssignmentService
from ..auth.dependencies import get_current_active_user, require_admin, verify_stage_assignment
from ..database import get_database
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/applications", tags=["Stage Assignments"])


class ReassignmentRequest(BaseModel):
    """Request model for reassigning a stage."""
    stage_number: int
    assigned_to: str
    reason: str


@router.post("/{application_id}/assign-stage", status_code=status.HTTP_201_CREATED)
async def assign_stage(
    application_id: str,
    assignment_request: StageAssignmentRequestModel,
    current_user: UserResponse = Depends(require_admin)
):
    """
    Assign a stage to a team member (admin only).
    
    Args:
        application_id: ID of the application
        assignment_request: Assignment details (stage_number, assigned_to, deadline, notes)
        current_user: Current authenticated admin user
        
    Returns:
        Assignment details
        
    Raises:
        HTTPException: If validation fails or user is not admin
    """
    assignment_service = AssignmentService()
    
    assignment = await assignment_service.assign_stage(
        application_id=application_id,
        stage_number=assignment_request.stage_number,
        assigned_to=assignment_request.assigned_to,
        assigned_by=current_user.id,
        deadline=assignment_request.deadline,
        notes=assignment_request.notes
    )
    
    return {
        "message": "Stage assigned successfully",
        "assignment": assignment.dict()
    }


@router.get("/{application_id}/assignments")
async def get_stage_assignments(
    application_id: str,
    current_user: UserResponse = Depends(get_current_active_user),
    db = Depends(get_database)
):
    """
    Get all assignments for an application (admin and assigned team member).
    
    Admins can see all assignments. Team members can only see their own assignments.
    
    Args:
        application_id: ID of the application
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        List of assignments with audit trail
        
    Raises:
        HTTPException: If application not found
    """
    assignment_service = AssignmentService()
    
    # Get all assignments for the application
    assignments = await assignment_service.get_stage_assignments(application_id)
    
    # If user is not admin, filter to only show their assignments
    if current_user.role != UserRole.ADMIN:
        assignments = [
            assignment for assignment in assignments
            if assignment.get("assigned_to") == current_user.id
        ]
    
    return {
        "application_id": application_id,
        "assignments": assignments
    }


@router.put("/{application_id}/reassign-stage")
async def reassign_stage(
    application_id: str,
    reassignment_request: ReassignmentRequest,
    current_user: UserResponse = Depends(require_admin)
):
    """
    Reassign a stage to a different team member (admin only).
    
    Args:
        application_id: ID of the application
        reassignment_request: Reassignment details (stage_number, assigned_to, reason)
        current_user: Current authenticated admin user
        
    Returns:
        New assignment details
        
    Raises:
        HTTPException: If validation fails or stage is completed
    """
    assignment_service = AssignmentService()
    
    assignment = await assignment_service.reassign_stage(
        application_id=application_id,
        stage_number=reassignment_request.stage_number,
        new_assigned_to=reassignment_request.assigned_to,
        assigned_by=current_user.id,
        reason=reassignment_request.reason
    )
    
    return {
        "message": "Stage reassigned successfully",
        "assignment": assignment.dict()
    }


@router.get("/my-assignments")
async def get_my_assignments(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get all assignments for the current team member.
    
    Returns list of stages assigned to the current user across all applications.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        List of assignments with application and stage details
    """
    # Verify user has appropriate role
    if current_user.role not in [UserRole.TEAM_MEMBER, UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members, HR, and admins can view assignments"
        )
    
    assignment_service = AssignmentService()
    assignments = await assignment_service.get_my_assignments(current_user.id)
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "assignments": assignments,
        "total_count": len(assignments)
    }


class BulkAssignmentRequest(BaseModel):
    """Request model for bulk assigning multiple stages."""
    stage_numbers: List[int]
    assigned_to: str
    deadline: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)


@router.post("/{application_id}/bulk-assign-stages", status_code=status.HTTP_201_CREATED)
async def bulk_assign_stages(
    application_id: str,
    bulk_assignment: BulkAssignmentRequest,
    current_user: UserResponse = Depends(require_admin)
):
    """
    Assign multiple stages to the same team member at once (admin only).
    
    Args:
        application_id: ID of the application
        bulk_assignment: Bulk assignment details (stage_numbers, assigned_to, deadline, notes)
        current_user: Current authenticated admin user
        
    Returns:
        Summary of assignments with success count and any errors
        
    Raises:
        HTTPException: If validation fails or user is not admin
    """
    assignment_service = AssignmentService()
    
    result = await assignment_service.bulk_assign_stages(
        application_id=application_id,
        stage_numbers=bulk_assignment.stage_numbers,
        assigned_to=bulk_assignment.assigned_to,
        assigned_by=current_user.id,
        deadline=bulk_assignment.deadline,
        notes=bulk_assignment.notes
    )
    
    return {
        "message": f"Bulk assignment completed: {result['success_count']} of {result['total_requested']} stages assigned successfully",
        "result": result
    }
