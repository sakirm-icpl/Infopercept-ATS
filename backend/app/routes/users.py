from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models.user import UserResponse, UserUpdate, UserCreate, UserRole
from ..services.user_service import UserService
from ..auth.dependencies import require_admin, require_hr_or_admin

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_create: UserCreate,
    current_user: UserResponse = Depends(require_admin)
):
    """Create a new user (Admin only)."""
    user_service = UserService()
    try:
        return await user_service.create_user(user_create)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[UserResponse])
async def get_all_users(current_user: UserResponse = Depends(require_admin)):
    """Get all users (Admin only)."""
    user_service = UserService()
    return await user_service.get_all_users()


@router.get("/team-members", response_model=List[UserResponse])
async def get_team_members(current_user: UserResponse = Depends(require_hr_or_admin)):
    """Get all team members (HR/Admin only)."""
    user_service = UserService()
    return await user_service.get_users_by_role(UserRole.TEAM_MEMBER)


@router.get("/candidates", response_model=List[UserResponse])
async def get_candidates(current_user: UserResponse = Depends(require_hr_or_admin)):
    """Get all candidates (HR/Admin only)."""
    user_service = UserService()
    return await user_service.get_users_by_role(UserRole.CANDIDATE)


@router.get("/assignment-users", response_model=List[UserResponse])
async def get_assignment_users(current_user: UserResponse = Depends(require_hr_or_admin)):
    """Get all users available for assignment (HR, Admin, Team Members - excluding candidates)."""
    print(f"get_assignment_users called by user: {current_user.email} with role: {current_user.role}")
    user_service = UserService()
    users = await user_service.get_assignment_users()
    print(f"Found {len(users)} assignment users")
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str, current_user: UserResponse = Depends(require_admin)):
    """Get user by ID (Admin only)."""
    user_service = UserService()
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str, 
    user_update: UserUpdate, 
    current_user: UserResponse = Depends(require_admin)
):
    """Update user (Admin only)."""
    user_service = UserService()
    user = await user_service.update_user(user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: UserResponse = Depends(require_admin)):
    """Delete user (Admin only)."""
    user_service = UserService()
    success = await user_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        ) 