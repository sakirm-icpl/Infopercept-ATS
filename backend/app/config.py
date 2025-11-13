from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os


class Settings(BaseSettings):
    # MongoDB Configuration
    mongodb_url: str = "mongodb://admin:password@ats_mongodb:27017/ats_db?authSource=admin"
    
    # Docker environment variables
    mongo_root_username: str = "admin"
    mongo_root_password: str = "password"
    mongo_database: str = "ats_db"
    mongo_express_username: str = "admin"
    mongo_express_password: str = "admin"
    
    # JWT Configuration
    jwt_secret: str = "your-super-secret-jwt-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # File Upload Configuration
    upload_dir: str = "./uploads"
    max_file_size: int = 52428800  # 50MB in bytes
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # CORS Configuration
    allowed_origins: Union[str, List[str]] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    @field_validator('allowed_origins', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True)