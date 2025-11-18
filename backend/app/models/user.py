from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
from datetime import datetime
from bson import ObjectId


class UserRole(str, Enum):
    ADMIN = "admin"
    HR = "hr"
    TEAM_MEMBER = "team_member"
    REQUESTER = "requester"  # New role for job requesters
    CEO = "ceo"  # CEO role with read-only access to all feedbacks
    CANDIDATE = "candidate"


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    mobile: str = Field(..., min_length=10, max_length=15)
    role: UserRole = UserRole.CANDIDATE


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    mobile: Optional[str] = Field(None, min_length=10, max_length=15)
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=6)


class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None