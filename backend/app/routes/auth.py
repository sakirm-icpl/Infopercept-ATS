from fastapi import APIRouter, Depends, HTTPException, status
from ..models.user import UserCreate, UserLogin, UserResponse, Token
from ..services.user_service import UserService
from ..auth.dependencies import get_current_active_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class EmailCheck(BaseModel):
    email: str


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user."""
    user_service = UserService()
    return await user_service.create_user(user_data)


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user and return JWT token."""
    user_service = UserService()
    return await user_service.login_user(user_credentials)


@router.post("/check-email")
async def check_email_exists(email_data: EmailCheck):
    """Check if an email exists in the database."""
    user_service = UserService()
    user = await user_service.get_user_by_email(email_data.email)
    return {"exists": user is not None}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user 