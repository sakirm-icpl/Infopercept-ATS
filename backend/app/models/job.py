from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
from bson import ObjectId


class JobStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CLOSED = "closed"


class JobType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class ExperienceLevel(str, Enum):
    ENTRY = "entry"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    MANAGER = "manager"


class JobBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    requirements: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    job_type: JobType
    experience_level: ExperienceLevel
    location: str = Field(..., max_length=100)
    salary_range: Optional[str] = Field(None, max_length=100)
    department: str = Field(..., max_length=100)
    status: JobStatus = JobStatus.ACTIVE
    skills_required: List[str] = Field(default_factory=list)
    benefits: List[str] = Field(default_factory=list)


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    requirements: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    location: Optional[str] = Field(None, max_length=100)
    salary_range: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    status: Optional[JobStatus] = None
    skills_required: Optional[List[str]] = None
    benefits: Optional[List[str]] = None


class JobInDB(JobBase):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    posted_by: str  # User ID who posted the job
    applications_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    posted_date: datetime = Field(default_factory=datetime.utcnow)
    closing_date: Optional[datetime] = None


class JobResponse(JobBase):
    id: str
    posted_by: str
    applications_count: int
    created_at: datetime
    updated_at: datetime
    posted_date: datetime
    closing_date: Optional[datetime] = None


class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int 