"""Application settings and configuration."""

from typing import List
from pydantic import ConfigDict, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings for the ATS Backend."""
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"  # Ignore extra environment variables not defined in model
    )
    
    # MongoDB Configuration
    mongodb_url: str = Field(default="mongodb://admin:InfoperceptATS%402024%21Secure@mongodb:27017/ats_production?authSource=admin")
    
    # JWT Configuration
    jwt_secret_key: str = Field(default="your-secret-key-change-in-production")
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_token_expire_minutes: int = Field(default=480)
    
    # CORS Configuration
    allowed_origins: List[str] = Field(default=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ])
    
    # File Upload Configuration
    upload_dir: str = Field(default="uploads")
    max_file_size: int = Field(default=10485760)  # 10MB
    allowed_file_types: str = Field(default=".pdf,.doc,.docx,.txt")
    storage_type: str = Field(default="local")
    storage_path: str = Field(default="/app/uploads")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    debug: bool = Field(default=False)
    environment: str = Field(default="development")
    
    # Security Configuration
    secret_key: str = Field(default="your-secret-key-change-in-production")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=480)
    refresh_token_expire_days: int = Field(default=7)
    
    # Password Policy
    min_password_length: int = Field(default=8)
    require_uppercase: bool = Field(default=True)
    require_lowercase: bool = Field(default=True)
    require_numbers: bool = Field(default=True)
    require_special_chars: bool = Field(default=True)
    
    # Application Settings
    app_name: str = Field(default="Infopercept ATS")
    app_version: str = Field(default="1.0.0")
    api_prefix: str = Field(default="/api")
    docs_url: str = Field(default="/docs")
    redoc_url: str = Field(default="/redoc")
    
    # Logging Configuration
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")
    log_file: str = Field(default="./logs/backend.log")
    
    # Performance Settings
    workers: int = Field(default=4)
    worker_class: str = Field(default="uvicorn.workers.UvicornWorker")
    timeout: int = Field(default=60)
    keepalive: int = Field(default=5)
    
    # Database Connection Pool
    db_min_pool_size: int = Field(default=10)
    db_max_pool_size: int = Field(default=50)
    
    # Feature Flags
    enable_docs: bool = Field(default=True)
    enable_registration: bool = Field(default=False)
    enable_email_verification: bool = Field(default=False)
    enable_password_reset: bool = Field(default=True)
    
    # Rate Limiting
    rate_limit_enabled: bool = Field(default=True)
    rate_limit_per_minute: int = Field(default=60)
    rate_limit_per_hour: int = Field(default=1000)
    
    # Session Configuration
    session_timeout_minutes: int = Field(default=480)
    max_login_attempts: int = Field(default=5)
    lockout_duration_minutes: int = Field(default=30)
    
    # File Storage
    max_upload_size: int = Field(default=10485760)
    
    # Notification Settings
    enable_email_notifications: bool = Field(default=False)
    enable_in_app_notifications: bool = Field(default=True)
    notification_retention_days: int = Field(default=90)
    
    # Backup Settings
    backup_enabled: bool = Field(default=True)
    backup_schedule: str = Field(default="0 2 * * *")
    backup_retention_days: int = Field(default=30)
    backup_path: str = Field(default="/app/backups")
    
    def __getattr__(self, name: str):
        """Handle backward compatibility for jwt_secret -> jwt_secret_key."""
        if name == "jwt_secret":
            return self.jwt_secret_key
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")


# Create settings instance
settings = Settings()
