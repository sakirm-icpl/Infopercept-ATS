from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
from ..models.application import (
    StageAssignmentRequest, StageAssignmentResponse, ApplicationResponse,
    HRScreening, PracticalLabTest, TechnicalInterview, HRRound, 
    BULeadInterview, CEOInterview, FinalRecommendationOffer
)
from ..models.user import UserResponse
from ..services.interview_service import InterviewService
from ..auth.dependencies import get_current_active_user
from ..models.user import UserRole

router = APIRouter(prefix="/api/interviews", tags=["Interview Management"])


@router.post("/applications/{application_id}/assign-stage", response_model=StageAssignmentResponse)
async def assign_stage(
    application_id: str,
    assignment: StageAssignmentRequest,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Assign a team member to a specific interview stage."""
    if current_user.role not in [UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin users can assign interview stages"
        )
    
    interview_service = InterviewService()
    return await interview_service.assign_stage(application_id, assignment, current_user.id)


@router.get("/applications/{application_id}/assignments", response_model=List[StageAssignmentResponse])
async def get_stage_assignments(
    application_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all stage assignments for an application."""
    interview_service = InterviewService()
    return await interview_service.get_stage_assignments(application_id, current_user)


@router.get("/my-assignments", response_model=List[dict])
async def get_my_assignments(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all applications assigned to the current team member or HR."""
    if current_user.role not in [UserRole.TEAM_MEMBER, UserRole.HR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members and HR can view their assignments"
        )
    
    interview_service = InterviewService()
    return await interview_service.get_my_assignments(current_user.id)


# Stage 1: HR Screening
@router.post("/applications/{application_id}/stage1", response_model=ApplicationResponse)
async def submit_stage1_feedback(
    application_id: str,
    feedback: HRScreening,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Submit HR Screening feedback."""
    if current_user.role not in [UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin users can submit HR screening feedback"
        )
    
    interview_service = InterviewService()
    return await interview_service.submit_stage1_feedback(application_id, feedback, current_user.id)


# Stage 2: Practical Lab Test
@router.post("/applications/{application_id}/stage2", response_model=ApplicationResponse)
async def submit_stage2_feedback(
    application_id: str,
    feedback: PracticalLabTest,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Submit Practical Lab Test feedback."""
    interview_service = InterviewService()
    return await interview_service.submit_stage2_feedback(application_id, feedback, current_user.id)


# Stage 3: Technical Interview
@router.post("/applications/{application_id}/stage3", response_model=ApplicationResponse)
async def submit_stage3_feedback(
    application_id: str,
    feedback: TechnicalInterview,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Submit Technical Interview feedback."""
    interview_service = InterviewService()
    return await interview_service.submit_stage3_feedback(application_id, feedback, current_user.id)


# Stage 4: HR Round
@router.post("/applications/{application_id}/stage4", response_model=ApplicationResponse)
async def submit_stage4_feedback(
    application_id: str,
    feedback: HRRound,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Submit HR Round feedback."""
    if current_user.role not in [UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin users can submit HR round feedback"
        )
    
    interview_service = InterviewService()
    return await interview_service.submit_stage4_feedback(application_id, feedback, current_user.id)


# Stage 5: BU Lead Interview
@router.post("/applications/{application_id}/stage5", response_model=ApplicationResponse)
async def submit_stage5_feedback(
    application_id: str,
    feedback: BULeadInterview,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Submit BU Lead Interview feedback."""
    interview_service = InterviewService()
    return await interview_service.submit_stage5_feedback(application_id, feedback, current_user.id)


# Stage 6: CEO Interview
@router.post("/applications/{application_id}/stage6", response_model=ApplicationResponse)
async def submit_stage6_feedback(
    application_id: str,
    feedback: CEOInterview,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Submit CEO Interview feedback."""
    interview_service = InterviewService()
    return await interview_service.submit_stage6_feedback(application_id, feedback, current_user.id)


# Stage 7: Final Recommendation & Offer
@router.post("/applications/{application_id}/stage7", response_model=ApplicationResponse)
async def submit_stage7_feedback(
    application_id: str,
    feedback: FinalRecommendationOffer,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Submit Final Recommendation & Offer feedback."""
    if current_user.role not in [UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin users can submit final recommendation feedback"
        )
    
    interview_service = InterviewService()
    return await interview_service.submit_stage7_feedback(application_id, feedback, current_user.id)


@router.post("/applications/{application_id}/forward-stage")
async def forward_to_next_stage(
    application_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Forward application to the next interview stage."""
    if current_user.role not in [UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR and Admin users can forward applications"
        )
    
    interview_service = InterviewService()
    return await interview_service.forward_to_next_stage(application_id, current_user.id)


@router.get("/applications/{application_id}/stage-status")
async def get_stage_status(
    application_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get the current stage status and progress for an application."""
    interview_service = InterviewService()
    return await interview_service.get_stage_status(application_id, current_user)