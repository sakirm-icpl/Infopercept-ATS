from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from ..models.job import JobCreate, JobResponse, JobUpdate, JobListResponse, JobStatus
from ..models.user import UserResponse
from ..services.job_service import JobService
from ..auth.dependencies import get_current_active_user, require_hr_or_admin

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Create a new job posting (HR/Admin only)"""
    job_service = JobService()
    return await job_service.create_job(job_data, current_user.id)


@router.get("/", response_model=JobListResponse)
async def get_jobs(
    status: Optional[JobStatus] = Query(None, description="Filter by job status"),
    department: Optional[str] = Query(None, description="Filter by department"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all jobs with filtering and pagination"""
    job_service = JobService()
    
    # For candidates, only show active jobs
    if current_user.role == "candidate":
        status = JobStatus.ACTIVE
    
    return await job_service.get_all_jobs(status=status, department=department, page=page, limit=limit)


@router.get("/active", response_model=List[JobResponse])
async def get_active_jobs(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get all active jobs (for candidates)"""
    job_service = JobService()
    return await job_service.get_active_jobs()


@router.get("/{job_id}", response_model=JobResponse)
async def get_job_by_id(
    job_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get a specific job by ID"""
    job_service = JobService()
    job = await job_service.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Update a job posting (HR/Admin only)"""
    job_service = JobService()
    return await job_service.update_job(job_id, job_data, current_user.id)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: str,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Delete a job posting (HR/Admin only)"""
    job_service = JobService()
    success = await job_service.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")


@router.post("/{job_id}/close", response_model=JobResponse)
async def close_job(
    job_id: str,
    current_user: UserResponse = Depends(require_hr_or_admin)
):
    """Close a job posting (HR/Admin only)"""
    job_service = JobService()
    return await job_service.close_job(job_id)


@router.get("/department/{department}", response_model=List[JobResponse])
async def get_jobs_by_department(
    department: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get jobs by department"""
    job_service = JobService()
    return await job_service.get_jobs_by_department(department) 