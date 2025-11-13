from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..models.application import FeedbackSubmission
from ..models.user import UserResponse, UserRole
from ..services.feedback_service import FeedbackService
from ..auth.dependencies import get_current_active_user, require_hr_or_admin
from ..config.feedback_templates import get_flattened_templates, get_all_templates
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/applications", tags=["Stage Feedback"])


@router.post("/{application_id}/stage/{stage_number}/feedback", status_code=status.HTTP_201_CREATED)
async def submit_stage_feedback(
    application_id: str,
    stage_number: int,
    feedback: FeedbackSubmission,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Submit feedback for an assigned stage (team member only).
    
    Team members can only submit feedback for stages assigned to them.
    Feedback includes approval status, performance rating (1-10), and comments.
    
    Args:
        application_id: ID of the application
        stage_number: Stage number (1-7)
        feedback: Feedback data (approval_status, performance_rating, comments)
        current_user: Current authenticated user
        
    Returns:
        Updated application with feedback
        
    Raises:
        HTTPException: If validation fails or user is not assigned to stage
    """
    # Verify user has appropriate role
    if current_user.role not in [UserRole.TEAM_MEMBER, UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members, HR, and admins can submit feedback"
        )
    
    feedback_service = FeedbackService()
    
    updated_application = await feedback_service.submit_feedback(
        application_id=application_id,
        stage_number=stage_number,
        feedback=feedback,
        submitted_by=current_user.id
    )
    
    return {
        "message": "Feedback submitted successfully",
        "application": updated_application
    }


@router.get("/{application_id}/stage/{stage_number}/feedback")
async def get_stage_feedback(
    application_id: str,
    stage_number: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get feedback for a specific stage (admin and assigned team member).
    
    Admins can view all feedback. Team members can only view feedback for stages
    assigned to them. Feedback is displayed in read-only mode for admins.
    
    Args:
        application_id: ID of the application
        stage_number: Stage number (1-7)
        current_user: Current authenticated user
        
    Returns:
        Feedback data with submitter details
        
    Raises:
        HTTPException: If validation fails or access denied
    """
    feedback_service = FeedbackService()
    
    feedback = await feedback_service.get_feedback(
        application_id=application_id,
        stage_number=stage_number,
        user_id=current_user.id,
        user_role=current_user.role.value
    )
    
    # Add read-only flag for admins
    is_read_only = current_user.role == UserRole.ADMIN
    feedback["is_read_only"] = is_read_only
    
    return {
        "feedback": feedback,
        "stage_number": stage_number,
        "application_id": application_id
    }


@router.post("/{application_id}/stage/{stage_number}/start")
async def start_stage_feedback(
    application_id: str,
    stage_number: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Mark a stage as "in_progress" when team member opens the feedback form.
    
    This endpoint should be called when a team member accesses the feedback form
    for an assigned stage. It updates the status from "assigned" to "in_progress".
    
    Args:
        application_id: ID of the application
        stage_number: Stage number (1-7)
        current_user: Current authenticated user
        
    Returns:
        Updated application
        
    Raises:
        HTTPException: If validation fails or user is not assigned to stage
    """
    # Verify user has appropriate role
    if current_user.role not in [UserRole.TEAM_MEMBER, UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members, HR, and admins can start stage feedback"
        )
    
    feedback_service = FeedbackService()
    
    updated_application = await feedback_service.update_stage_status(
        application_id=application_id,
        stage_number=stage_number,
        status="in_progress",
        user_id=current_user.id
    )
    
    return {
        "message": "Stage marked as in progress",
        "application": updated_application
    }


@router.put("/{application_id}/stage/{stage_number}/status")
async def update_stage_status(
    application_id: str,
    stage_number: int,
    status: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Update the status of a stage (assigned team member only).
    
    Valid status transitions:
    - pending -> assigned (done by admin during assignment)
    - assigned -> in_progress (when team member opens feedback form)
    - in_progress -> completed (when feedback is submitted)
    
    Args:
        application_id: ID of the application
        stage_number: Stage number (1-7)
        status: New status (assigned, in_progress, completed)
        current_user: Current authenticated user
        
    Returns:
        Updated application
        
    Raises:
        HTTPException: If validation fails or invalid status transition
    """
    # Verify user has appropriate role
    if current_user.role not in [UserRole.TEAM_MEMBER, UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members, HR, and admins can update stage status"
        )
    
    feedback_service = FeedbackService()
    
    updated_application = await feedback_service.update_stage_status(
        application_id=application_id,
        stage_number=stage_number,
        status=status,
        user_id=current_user.id
    )
    
    return {
        "message": f"Stage status updated to {status}",
        "application": updated_application
    }


@router.get("/feedback/statistics")
async def get_feedback_statistics(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """
    Get feedback statistics across all applications (admin/HR only).
    
    Returns comprehensive statistics including:
    - Rating distribution
    - Team member performance statistics
    - Average ratings by stage
    - Approval/rejection rates
    
    Args:
        start_date: Optional start date filter
        end_date: Optional end date filter
        current_user: Current authenticated user (must be admin/HR)
        
    Returns:
        Statistics data
        
    Raises:
        HTTPException: If validation fails or access denied
    """
    feedback_service = FeedbackService()
    
    # Parse dates if provided
    start_datetime = None
    end_datetime = None
    
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use YYYY-MM-DD"
            )
    
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
            # Set to end of day
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use YYYY-MM-DD"
            )
    
    statistics = await feedback_service.get_feedback_statistics(
        start_date=start_datetime,
        end_date=end_datetime
    )
    
    return {
        "statistics": statistics,
        "filters": {
            "start_date": start_date,
            "end_date": end_date
        }
    }



@router.get("/feedback/templates")
async def get_feedback_templates(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get predefined feedback comment templates.
    
    Returns a list of categorized templates that team members can use
    to provide consistent and comprehensive feedback efficiently.
    
    Templates are organized by category:
    - Strong Candidate: For highly qualified candidates
    - Needs Improvement: For candidates with potential but gaps
    - Not Suitable: For candidates who don't meet requirements
    - Neutral/General: For standard evaluations
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        List of templates with category information
    """
    # Get templates in flattened format for easy consumption
    templates = get_flattened_templates()
    
    return {
        "templates": templates,
        "categories": get_all_templates()
    }
