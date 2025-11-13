import os
import aiofiles
import uuid
from datetime import datetime
from fastapi import UploadFile, HTTPException, status
from ..config import settings


async def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return filename."""
    try:
        # Validate file size
        if upload_file.size and upload_file.size > settings.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size ({upload_file.size} bytes) exceeds maximum limit of {settings.max_file_size} bytes"
            )
        
        # Validate file type (only allow PDF, DOC, DOCX)
        allowed_extensions = {'.pdf', '.doc', '.docx'}
        file_extension = os.path.splitext(upload_file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type '{file_extension}' not allowed. Only PDF, DOC, and DOCX files are allowed"
            )
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"{timestamp}_{unique_id}{file_extension}"
        file_path = os.path.join(settings.upload_dir, filename)
        
        # Ensure upload directory exists
        os.makedirs(settings.upload_dir, exist_ok=True)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await upload_file.read()
            await f.write(content)
        
        return filename
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )


async def delete_file(filename: str) -> bool:
    """Delete file by filename."""
    try:
        file_path = os.path.join(settings.upload_dir, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False


def get_file_path(filename: str) -> str:
    """Get full file path for a filename."""
    return os.path.join(settings.upload_dir, filename)


def file_exists(filename: str) -> bool:
    """Check if file exists."""
    file_path = os.path.join(settings.upload_dir, filename)
    return os.path.exists(file_path) 