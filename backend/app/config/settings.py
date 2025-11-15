"""Application settings and configuration."""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    app_name: str = "Applicant Tracking System"
    app_version: str = "1.0.0"
    
    # CORS Settings
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # File Upload Settings
    upload_dir: str = "uploads"
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    max_file_size: int = 10 * 1024 * 1024  # 10MB (for file upload validation)
    
    # Database Settings
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://mongodb:27017")
    database_name: str = os.getenv("DATABASE_NAME", "ats_db")
    
    # JWT Settings
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create settings instance
settings = Settings()
