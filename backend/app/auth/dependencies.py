from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from ..database import get_database
from ..models.user import UserRole, UserResponse
from .jwt import verify_token
from bson import ObjectId

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_database)
) -> UserResponse:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
    
    # Get user from database
    user = await db.users.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    
    # Convert ObjectId to string
    user["id"] = str(user["_id"])
    del user["_id"]
    
    return UserResponse(**user)


async def get_current_active_user(
    current_user: UserResponse = Depends(get_current_user)
) -> UserResponse:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def require_role(required_role: UserRole):
    """Dependency to require a specific role."""
    async def role_checker(
        current_user: UserResponse = Depends(get_current_active_user)
    ) -> UserResponse:
        if current_user.role != required_role and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role.value}"
            )
        return current_user
    return role_checker


def require_roles(required_roles: list[UserRole]):
    """Dependency to require one of the specified roles."""
    async def roles_checker(
        current_user: UserResponse = Depends(get_current_active_user)
    ) -> UserResponse:
        if current_user.role not in required_roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[role.value for role in required_roles]}"
            )
        return current_user
    return roles_checker


# Specific role dependencies
require_admin = require_role(UserRole.ADMIN)
require_hr = require_role(UserRole.HR)
require_team_member = require_role(UserRole.TEAM_MEMBER)
require_candidate = require_role(UserRole.CANDIDATE)
require_hr_or_admin = require_roles([UserRole.HR, UserRole.ADMIN])
require_hr_team_or_admin = require_roles([UserRole.HR, UserRole.TEAM_MEMBER, UserRole.ADMIN])
require_team_or_admin = require_roles([UserRole.TEAM_MEMBER, UserRole.ADMIN])


async def verify_stage_assignment(
    application_id: str,
    stage_number: int,
    user_id: str,
    db
) -> bool:
    """
    Verify that a user is assigned to a specific stage.
    
    Args:
        application_id: ID of the application
        stage_number: Stage number (1-7)
        user_id: User ID to verify
        db: Database instance
        
    Returns:
        bool: True if user is assigned to the stage, False otherwise
    """
    try:
        application = await db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            return False
        
        assigned_to = application.get("stages", {}).get(f"stage{stage_number}_assigned_to")
        return assigned_to == user_id
    except Exception:
        return False 