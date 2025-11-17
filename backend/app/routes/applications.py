from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from ..models.application import (
    ApplicationCreate, ApplicationResponse, ApplicationListResponse,
    HRScreening, PracticalLabTest, TechnicalInterview, HRRound,
    BULeadInterview, CEOInterview, FinalRecommendationOffer,
    StageAssignmentRequest, StageAssignmentResponse
)
from ..models.user import UserResponse, UserRole
from ..services.application_service import ApplicationService
from ..auth.dependencies import get_current_active_user, require_candidate, require_hr_or_admin, require_hr_team_or_admin, require_team_member
from ..utils.file_upload import save_upload_file
import json

router = APIRouter(prefix="/api/applications", tags=["Applications"])


@router.post("/apply-on-behalf", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_on_behalf(
    candidate_id: str = Form(...),
    job_id: str = Form(...),
    resume: Optional[UploadFile] = File(None),
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Apply on behalf of a candidate (HR/Admin only)."""
    try:
        application_service = ApplicationService()
        
        # Get candidate information
        from ..services.user_service import UserService
        user_service = UserService()
        candidate = await user_service.get_user_by_id(candidate_id)
        
        if not candidate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate not found"
            )
        
        if candidate.role != UserRole.CANDIDATE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected user is not a candidate"
            )
        
        # Save resume file if provided
        resume_filename = None
        if resume:
            try:
                resume_filename = await save_upload_file(resume)
            except HTTPException as e:
                raise e
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to process resume file: {str(e)}"
                )
        
        # Create application data
        application_data = ApplicationCreate(
            name=candidate.username,
            email=candidate.email,
            mobile=candidate.mobile,
            job_id=job_id,
            date_of_application=datetime.utcnow(),
            resume_filename=resume_filename
        )
        
        return await application_service.create_application(application_data, candidate_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create application: {str(e)}"
        )


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    name: str = Form(...),
    email: str = Form(...),
    mobile: str = Form(...),
    job_id: str = Form(...),
    date_of_application: str = Form(...),
    resume: Optional[UploadFile] = File(None),
    current_user: UserResponse = Depends(require_candidate)
):
    """Create a new application (Candidate only)."""
    try:
        application_service = ApplicationService()
        
        # Parse date
        try:
            parsed_date = datetime.fromisoformat(date_of_application.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
            )
        
        # Save resume file if provided
        resume_filename = None
        if resume:
            try:
                resume_filename = await save_upload_file(resume)
            except HTTPException as e:
                raise e
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to process resume file: {str(e)}"
                )
        
        # Create application data
        application_data = ApplicationCreate(
            name=name,
            email=email,
            mobile=mobile,
            job_id=job_id,
            date_of_application=parsed_date,
            resume_filename=resume_filename
        )
        
        return await application_service.create_application(application_data, current_user.id)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create application: {str(e)}"
        )


@router.get("/", response_model=List[ApplicationListResponse])
async def get_applications(current_user: UserResponse = Depends(get_current_active_user)):
    """Get applications based on user role."""
    application_service = ApplicationService()
    
    if current_user.role == UserRole.CANDIDATE:
        return await application_service.get_all_applications(current_user.role, current_user.id)
    else:
        return await application_service.get_all_applications(current_user.role)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application_by_id(
    application_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get application by ID."""
    application_service = ApplicationService()
    application = await application_service.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check access permissions
    if current_user.role == UserRole.CANDIDATE and application.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return application


@router.put("/{application_id}/stage/1", response_model=ApplicationResponse)
async def update_stage1_feedback(
    application_id: str,
    stage_data: HRScreening,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update Stage 1: HR Screening feedback."""
    application_service = ApplicationService()
    return await application_service.update_stage_feedback(application_id, 1, stage_data.dict())


@router.put("/{application_id}/stage/2", response_model=ApplicationResponse)
async def update_stage2_feedback(
    application_id: str,
    stage_data: PracticalLabTest,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update Stage 2: Hands-On Practical Lab Test feedback."""
    application_service = ApplicationService()
    return await application_service.update_stage_feedback(application_id, 2, stage_data.dict())


@router.put("/{application_id}/stage/3", response_model=ApplicationResponse)
async def update_stage3_feedback(
    application_id: str,
    stage_data: TechnicalInterview,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update Stage 3: Technical Interview feedback."""
    application_service = ApplicationService()
    return await application_service.update_stage_feedback(application_id, 3, stage_data.dict())


@router.put("/{application_id}/stage/4", response_model=ApplicationResponse)
async def update_stage4_feedback(
    application_id: str,
    stage_data: HRRound,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update Stage 4: HR Round feedback."""
    application_service = ApplicationService()
    return await application_service.update_stage_feedback(application_id, 4, stage_data.dict())


@router.put("/{application_id}/stage/5", response_model=ApplicationResponse)
async def update_stage5_feedback(
    application_id: str,
    stage_data: BULeadInterview,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update Stage 5: BU Lead Interview feedback."""
    application_service = ApplicationService()
    return await application_service.update_stage_feedback(application_id, 5, stage_data.dict())


@router.put("/{application_id}/stage/6", response_model=ApplicationResponse)
async def update_stage6_feedback(
    application_id: str,
    stage_data: CEOInterview,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update Stage 6: CEO Interview feedback."""
    application_service = ApplicationService()
    return await application_service.update_stage_feedback(application_id, 6, stage_data.dict())


@router.put("/{application_id}/final-recommendation", response_model=ApplicationResponse)
async def update_final_recommendation(
    application_id: str,
    recommendation_data: FinalRecommendationOffer,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update final recommendation."""
    application_service = ApplicationService()
    return await application_service.update_final_recommendation(application_id, recommendation_data.dict())


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: str,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Delete an application (HR/Admin only)."""
    application_service = ApplicationService()
    await application_service.delete_application(application_id)


@router.put("/{application_id}/stage/{stage_number}/forward", response_model=ApplicationResponse)
async def forward_stage_to_hr(
    application_id: str,
    stage_number: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Forward a completed stage to HR for review."""
    application_service = ApplicationService()
    return await application_service.forward_stage_to_hr(application_id, stage_number, current_user.id)


@router.put("/{application_id}/stage/{stage_number}/team-feedback", response_model=ApplicationResponse)
async def submit_team_member_feedback(
    application_id: str,
    stage_number: int,
    feedback_data: dict,
    current_user: UserResponse = Depends(require_team_member)
):
    """Submit team member feedback for a specific stage."""
    # Use interview service to handle team member feedback submission
    from ..services.interview_service import InterviewService
    interview_service = InterviewService()
    
    # Create appropriate feedback model based on stage number
    from ..models.application import (
        HRScreening, PracticalLabTest, TechnicalInterview, 
        HRRound, BULeadInterview, CEOInterview
    )
    
    # Map stage numbers to feedback models
    stage_models = {
        1: HRScreening,
        2: PracticalLabTest,
        3: TechnicalInterview,
        4: HRRound,
        5: BULeadInterview,
        6: CEOInterview
    }
    
    if stage_number not in stage_models:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stage number"
        )
    
    # Validate feedback data
    try:
        feedback_model = stage_models[stage_number](**feedback_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feedback data: {str(e)}"
        )
    
    # Submit feedback using interview service
    return await interview_service._submit_stage_feedback(
        application_id, stage_number, feedback_model.dict(), current_user.id, 
        f"stage{stage_number}_{interview_service._get_stage_field_name(stage_number)}"
    )


@router.put("/{application_id}/stage/{stage_number}/approve", response_model=ApplicationResponse)
async def approve_stage(
    application_id: str,
    stage_number: int,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Approve a forwarded stage and move to next stage."""
    application_service = ApplicationService()
    return await application_service.approve_stage_by_hr(application_id, stage_number, current_user.id)


@router.put("/{application_id}/stage/{stage_number}/reject", response_model=ApplicationResponse)
async def reject_stage(
    application_id: str,
    stage_number: int,
    reason_data: dict,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Reject a forwarded stage and provide reason."""
    application_service = ApplicationService()
    reason = reason_data.get("reason", "")
    return await application_service.reject_stage_by_hr(application_id, stage_number, reason, current_user.id)


# Team Member Assignment Endpoints