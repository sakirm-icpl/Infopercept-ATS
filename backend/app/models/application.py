from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from enum import Enum
from datetime import datetime
from bson import ObjectId


class CommunicationLevel(str, Enum):
    POOR = "Poor"
    AVERAGE = "Average"
    GOOD = "Good"
    EXCELLENT = "Excellent"


class CompletionStatus(str, Enum):
    COMPLETE = "Complete"
    INCOMPLETE = "Incomplete"


class TestResult(str, Enum):
    PASS = "Pass"
    FAIL = "Fail"


class Outcome(str, Enum):
    YES = "Yes"
    NO = "No"


class FinalStatus(str, Enum):
    SELECT = "Select"
    HOLD = "Hold"
    REJECT = "Reject"


class HRPanel(str, Enum):
    MUSKAN = "Muskan"
    VIDHI = "Vidhi"
    KOMAL = "Komal"
    NIKITA = "Nikita"


# New models for Stage Assignment and Feedback System
class StageFeedback(BaseModel):
    """Feedback model for stage assignments"""
    approval_status: Literal["Approved", "Rejected"]
    performance_rating: int = Field(..., ge=1, le=10)
    comments: str = Field(..., min_length=1, max_length=1000)
    submitted_by: str  # User ID
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None
    edit_count: int = 0


class FeedbackSubmission(BaseModel):
    """Request model for submitting feedback"""
    approval_status: Literal["Approved", "Rejected"]
    performance_rating: int = Field(..., ge=1, le=10)
    comments: str = Field(..., min_length=1, max_length=1000)


class StageAssignmentModel(BaseModel):
    """Model for tracking stage assignments in audit trail"""
    application_id: str
    stage_number: int = Field(..., ge=1, le=7)
    assigned_to: str  # User ID
    assigned_by: str  # Admin User ID
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    status: Literal["assigned", "in_progress", "completed"] = "assigned"
    deadline: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)
    reassigned_from: Optional[str] = None  # User ID if reassigned
    reassignment_reason: Optional[str] = None
    completed_at: Optional[datetime] = None


class StageAssignmentRequestModel(BaseModel):
    """Request model for assigning a stage to a team member"""
    stage_number: int = Field(..., ge=1, le=7)
    assigned_to: str  # User ID
    deadline: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)


# Stage 1: HR Screening
class HRScreening(BaseModel):
    panel_name: HRPanel
    panel_feedback: str = Field(..., max_length=500)
    mcq_test_score: Optional[int] = Field(None, ge=0, le=100)
    panel_comments: str = Field(..., max_length=500)
    communication_skills: CommunicationLevel
    scale: int = Field(..., ge=1, le=10)
    reason_for_scale: str = Field(..., max_length=500)
    outcome: Outcome
    completed_at: Optional[datetime] = None
    submitted_by: str  # User ID of the submitter for blind feedback


# Stage 2: Hands-On Practical Lab Test
class PracticalLabTest(BaseModel):
    panel_name: str = Field(..., max_length=100)
    completion_status: CompletionStatus
    reviewer_comments: str = Field(..., max_length=500)
    test_result: TestResult
    completed_at: Optional[datetime] = None
    submitted_by: str  # User ID of the submitter for blind feedback


# Stage 3: Technical Interview
class TechnicalInterview(BaseModel):
    panel_name: str = Field(..., max_length=100)
    feedback: str = Field(..., max_length=1000)
    scale: int = Field(..., ge=1, le=10)
    reason_for_scale: str = Field(..., max_length=500)
    outcome: Outcome
    completed_at: Optional[datetime] = None
    submitted_by: str  # User ID of the submitter for blind feedback


# Stage 4: HR Round
class HRRound(BaseModel):
    panel_name: str = Field(..., max_length=100)
    feedback: str = Field(..., max_length=1000)
    scale: int = Field(..., ge=1, le=10)
    reason_for_scale: str = Field(..., max_length=500)
    outcome: Outcome
    communication_rating: int = Field(..., ge=1, le=5)
    cultural_fit_rating: int = Field(..., ge=1, le=5)
    passion_rating: int = Field(..., ge=1, le=5)
    leadership_potential_rating: int = Field(..., ge=1, le=5)
    learning_agility_rating: int = Field(..., ge=1, le=5)
    completed_at: Optional[datetime] = None
    submitted_by: str  # User ID of the submitter for blind feedback


# Stage 5: BU Lead Interview
class BULeadInterview(BaseModel):
    panel_name: str = Field(..., max_length=100)
    feedback: str = Field(..., max_length=1000)
    scale: int = Field(..., ge=1, le=10)
    reason_for_scale: str = Field(..., max_length=500)
    outcome: Outcome
    completed_at: Optional[datetime] = None
    submitted_by: str  # User ID of the submitter for blind feedback


# Stage 6: CEO Interview
class CEOInterview(BaseModel):
    panel_name: str = Field(..., max_length=100)
    feedback: str = Field(..., max_length=1000)
    scale: int = Field(..., ge=1, le=10)
    reason_for_scale: str = Field(..., max_length=500)
    outcome: Outcome
    completed_at: Optional[datetime] = None
    submitted_by: str  # User ID of the submitter for blind feedback


# Stage 7: Final Recommendation & Offer
class FinalRecommendationOffer(BaseModel):
    status: FinalStatus
    cumulative_scale: int = Field(..., ge=1, le=10)
    suggestions: str = Field(..., max_length=1000)
    completed_at: Optional[datetime] = None
    submitted_by: str  # User ID of the submitter for blind feedback


# Application Stages
class ApplicationStages(BaseModel):
    stage1_hr_screening: Optional[HRScreening] = None
    stage2_practical_lab: Optional[PracticalLabTest] = None
    stage3_technical_interview: Optional[TechnicalInterview] = None
    stage4_hr_round: Optional[HRRound] = None
    stage5_bu_lead_interview: Optional[BULeadInterview] = None
    stage6_ceo_interview: Optional[CEOInterview] = None
    stage7_final_recommendation: Optional[FinalRecommendationOffer] = None
    
    # Team Member Assignments for each stage
    stage1_assigned_to: Optional[str] = None  # User ID of assigned team member
    stage2_assigned_to: Optional[str] = None
    stage3_assigned_to: Optional[str] = None
    stage4_assigned_to: Optional[str] = None
    stage5_assigned_to: Optional[str] = None
    stage6_assigned_to: Optional[str] = None
    stage7_assigned_to: Optional[str] = None
    
    # Stage status tracking - updated to include "assigned", "in_progress", "completed"
    stage1_status: str = "pending"  # pending, assigned, in_progress, completed
    stage2_status: str = "pending"
    stage3_status: str = "pending"
    stage4_status: str = "pending"
    stage5_status: str = "pending"
    stage6_status: str = "pending"
    stage7_status: str = "pending"
    
    # Stage feedback for each stage
    stage1_feedback: Optional[StageFeedback] = None
    stage2_feedback: Optional[StageFeedback] = None
    stage3_feedback: Optional[StageFeedback] = None
    stage4_feedback: Optional[StageFeedback] = None
    stage5_feedback: Optional[StageFeedback] = None
    stage6_feedback: Optional[StageFeedback] = None
    stage7_feedback: Optional[StageFeedback] = None
    
    # Stage deadlines for each stage
    stage1_deadline: Optional[datetime] = None
    stage2_deadline: Optional[datetime] = None
    stage3_deadline: Optional[datetime] = None
    stage4_deadline: Optional[datetime] = None
    stage5_deadline: Optional[datetime] = None
    stage6_deadline: Optional[datetime] = None
    stage7_deadline: Optional[datetime] = None


# Application Base
class ApplicationBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    mobile: str = Field(..., min_length=10, max_length=15)
    job_id: str  # Reference to the job being applied for
    date_of_application: datetime
    resume_filename: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    mobile: Optional[str] = Field(None, min_length=10, max_length=15)
    job_id: Optional[str] = None
    date_of_application: Optional[datetime] = None
    resume_filename: Optional[str] = None


class ApplicationInDB(ApplicationBase):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    candidate_id: str
    stages: ApplicationStages = Field(default_factory=ApplicationStages)
    current_stage: int = Field(default=1, ge=1, le=7)  # Updated to 7 stages
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ApplicationResponse(ApplicationBase):
    id: str
    candidate_id: str
    stages: ApplicationStages
    current_stage: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    job_id: str
    job_title: str  # Will be populated from job data
    current_stage: int
    status: str
    created_at: datetime
    updated_at: datetime
    date_of_application: datetime
    mobile: str


# Team Member Assignment Models
class StageAssignment(BaseModel):
    stage_number: int = Field(..., ge=1, le=7)  # Updated to 7 stages
    assigned_to: str  # User ID of team member
    assigned_by: str  # User ID of HR who made the assignment
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(None, max_length=500)


class StageAssignmentRequest(BaseModel):
    stage_number: int = Field(..., ge=1, le=7)  # Updated to 7 stages
    assigned_to: str  # User ID of team member
    notes: Optional[str] = Field(None, max_length=500)


class StageAssignmentResponse(BaseModel):
    id: str
    application_id: str
    stage_number: int
    assigned_to: str
    assigned_by: str
    assigned_at: datetime
    notes: Optional[str] = None
    status: str  # pending, completed, forwarded