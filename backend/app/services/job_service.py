from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from ..database import get_database
from ..models.job import JobCreate, JobInDB, JobUpdate, JobResponse, JobListResponse, JobStatus
from fastapi import HTTPException, status


class JobService:
    def __init__(self):
        self.db = get_database()

    async def create_job(self, job_data: JobCreate, posted_by: str) -> JobResponse:
        """Create a new job posting"""
        job_dict = job_data.dict()
        job_dict["posted_by"] = posted_by
        job_dict["applications_count"] = 0
        
        job = JobInDB(**job_dict)
        
        result = await self.db.jobs.insert_one(job.dict())
        job.id = str(result.inserted_id)
        
        return JobResponse(**job.dict())

    async def get_job_by_id(self, job_id: str) -> Optional[JobResponse]:
        """Get a job by ID"""
        job_data = await self.db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job_data:
            return None
        
        job_data["id"] = str(job_data["_id"])
        if "posted_by" in job_data and isinstance(job_data["posted_by"], ObjectId):
            job_data["posted_by"] = str(job_data["posted_by"])
        return JobResponse(**job_data)

    async def get_all_jobs(self, status: Optional[JobStatus] = None, 
                          department: Optional[str] = None,
                          page: int = 1, limit: int = 10) -> JobListResponse:
        """Get all jobs with optional filtering and pagination"""
        filter_query = {}
        
        if status:
            filter_query["status"] = status.value
        
        if department:
            filter_query["department"] = department
        
        # Count total jobs
        total = await self.db.jobs.count_documents(filter_query)
        
        # Get jobs with pagination
        skip = (page - 1) * limit
        cursor = self.db.jobs.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        
        jobs = []
        async for job_data in cursor:
            job_data["id"] = str(job_data["_id"])
            if "posted_by" in job_data and isinstance(job_data["posted_by"], ObjectId):
                job_data["posted_by"] = str(job_data["posted_by"])
            jobs.append(JobResponse(**job_data))
        
        return JobListResponse(
            jobs=jobs,
            total=total,
            page=page,
            limit=limit
        )

    async def get_active_jobs(self) -> List[JobResponse]:
        """Get all active jobs for candidates to view"""
        cursor = self.db.jobs.find({"status": JobStatus.ACTIVE.value}).sort("created_at", -1)
        
        jobs = []
        async for job_data in cursor:
            job_data["id"] = str(job_data["_id"])
            if "posted_by" in job_data and isinstance(job_data["posted_by"], ObjectId):
                job_data["posted_by"] = str(job_data["posted_by"])
            jobs.append(JobResponse(**job_data))
        
        return jobs

    async def update_job(self, job_id: str, job_data: JobUpdate, updated_by: str) -> JobResponse:
        """Update a job posting"""
        job = await self.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        
        # Update only provided fields
        update_data = job_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update job")
        
        # Return updated job
        updated_job = await self.get_job_by_id(job_id)
        if not updated_job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found after update")
        return updated_job

    async def delete_job(self, job_id: str) -> bool:
        """Delete a job posting"""
        result = await self.db.jobs.delete_one({"_id": ObjectId(job_id)})
        return result.deleted_count > 0

    async def update_applications_count(self, job_id: str, increment: bool = True) -> bool:
        """Update the applications count for a job"""
        operation = "$inc" if increment else "$dec"
        result = await self.db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {operation: {"applications_count": 1}}
        )
        return result.modified_count > 0

    async def get_jobs_by_department(self, department: str) -> List[JobResponse]:
        """Get jobs by department"""
        cursor = self.db.jobs.find({"department": department, "status": JobStatus.ACTIVE.value})
        
        jobs = []
        async for job_data in cursor:
            job_data["id"] = str(job_data["_id"])
            if "posted_by" in job_data and isinstance(job_data["posted_by"], ObjectId):
                job_data["posted_by"] = str(job_data["posted_by"])
            jobs.append(JobResponse(**job_data))
        
        return jobs

    async def close_job(self, job_id: str) -> JobResponse:
        """Close a job posting"""
        job = await self.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        
        result = await self.db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {
                "$set": {
                    "status": JobStatus.CLOSED.value,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to close job")
        
        closed_job = await self.get_job_by_id(job_id)
        if not closed_job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found after closing")
        return closed_job 