from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class NotificationModel(BaseModel):
    """Model for notification data."""
    user_id: str  # User ID who receives the notification
    type: Literal["assignment", "reassignment", "deadline_warning"]
    title: str
    message: str
    application_id: str
    stage_number: int = Field(..., ge=1, le=7)
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class NotificationResponse(BaseModel):
    """Response model for notification."""
    id: str
    user_id: str
    type: str
    title: str
    message: str
    application_id: str
    stage_number: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    # Additional fields for UI
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    stage_name: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class NotificationCreate(BaseModel):
    """Request model for creating a notification."""
    user_id: str
    type: Literal["assignment", "reassignment", "deadline_warning"]
    title: str
    message: str
    application_id: str
    stage_number: int = Field(..., ge=1, le=7)
