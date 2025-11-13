from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from ..database import get_database
from ..models.user import UserCreate, UserInDB, UserUpdate, UserResponse, UserLogin, Token
from ..auth.jwt import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status
from ..models.user import UserRole


class UserService:
    def __init__(self):
        self.db = get_database()

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user."""
        # Check if email already exists
        existing_user = await self.db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username already exists
        existing_username = await self.db.users.find_one({"username": user_data.username})
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Check if mobile already exists
        existing_mobile = await self.db.users.find_one({"mobile": user_data.mobile})
        if existing_mobile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number already registered"
            )
        
        # Create user document
        user_dict = user_data.dict()
        user_dict["hashed_password"] = get_password_hash(user_data.password)
        del user_dict["password"]
        
        user_in_db = UserInDB(**user_dict)
        user_doc = user_in_db.dict()
        
        # Insert into database
        result = await self.db.users.insert_one(user_doc)
        user_doc["id"] = str(result.inserted_id)
        del user_doc["_id"]
        
        # Ensure role is set correctly
        if "role" not in user_doc or not user_doc["role"]:
            user_doc["role"] = "candidate"
        
        return UserResponse(**user_doc)

    async def authenticate_user(self, email: str, password: str) -> Optional[UserResponse]:
        """Authenticate user with email and password."""
        user = await self.db.users.find_one({"email": email})
        if not user:
            return None
        
        if not verify_password(password, user["hashed_password"]):
            return None
        
        # Convert ObjectId to string
        user["id"] = str(user["_id"])
        del user["_id"]
        
        return UserResponse(**user)

    async def login_user(self, user_credentials: UserLogin) -> Token:
        """Login user and return JWT token."""
        # First check if email exists
        user_by_email = await self.db.users.find_one({"email": user_credentials.email})
        if not user_by_email:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found. Please sign up to create an account.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Now authenticate with password
        user = await self.authenticate_user(user_credentials.email, user_credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value}
        )
        
        return Token(access_token=access_token, user=user)

    async def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        """Get user by ID."""
        try:
            user = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return None
            
            user["id"] = str(user["_id"])
            del user["_id"]
            
            return UserResponse(**user)
        except Exception:
            return None

    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Get user by email."""
        user = await self.db.users.find_one({"email": email})
        if not user:
            return None
        
        user["id"] = str(user["_id"])
        del user["_id"]
        
        return UserResponse(**user)

    async def get_all_users(self) -> List[UserResponse]:
        """Get all users."""
        try:
            users = await self.db.users.find().to_list(length=None)
            user_responses = []
            for user in users:
                user["id"] = str(user["_id"])
                del user["_id"]
                user_responses.append(UserResponse(**user))
            return user_responses
        except Exception:
            return []

    async def get_users_by_role(self, role: UserRole) -> List[UserResponse]:
        """Get users by role."""
        try:
            users = await self.db.users.find({"role": role.value}).to_list(length=None)
            user_responses = []
            for user in users:
                user["id"] = str(user["_id"])
                del user["_id"]
                user_responses.append(UserResponse(**user))
            return user_responses
        except Exception:
            return []

    async def get_assignment_users(self) -> List[UserResponse]:
        """Get all users available for assignment (HR, Admin, Team Members - excluding candidates)."""
        try:
            print("get_assignment_users: Querying database for assignment users...")
            users = await self.db.users.find({
                "role": {"$in": ["hr", "admin", "team_member"]}
            }).to_list(length=None)
            print(f"get_assignment_users: Found {len(users)} users in database")
            
            user_responses = []
            for user in users:
                user["id"] = str(user["_id"])
                del user["_id"]
                user_responses.append(UserResponse(**user))
                print(f"get_assignment_users: Added user {user['username']} with role {user['role']}")
            
            print(f"get_assignment_users: Returning {len(user_responses)} users")
            return user_responses
        except Exception as e:
            print(f"get_assignment_users: Error occurred: {e}")
            return []

    async def update_user(self, user_id: str, user_update: UserUpdate) -> Optional[UserResponse]:
        """Update user information."""
        try:
            update_data = user_update.dict(exclude_unset=True)
            if not update_data:
                return await self.get_user_by_id(user_id)
            
            # Handle password update
            if "password" in update_data:
                from ..auth.jwt import get_password_hash
                update_data["hashed_password"] = get_password_hash(update_data["password"])
                del update_data["password"]
            
            # Check for unique constraints if updating email, username, or mobile
            if "email" in update_data:
                existing_email = await self.db.users.find_one({
                    "email": update_data["email"],
                    "_id": {"$ne": ObjectId(user_id)}
                })
                if existing_email:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already registered"
                    )
            
            if "username" in update_data:
                existing_username = await self.db.users.find_one({
                    "username": update_data["username"],
                    "_id": {"$ne": ObjectId(user_id)}
                })
                if existing_username:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Username already taken"
                    )
            
            if "mobile" in update_data:
                existing_mobile = await self.db.users.find_one({
                    "mobile": update_data["mobile"],
                    "_id": {"$ne": ObjectId(user_id)}
                })
                if existing_mobile:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Mobile number already registered"
                    )
            
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                return None
            
            return await self.get_user_by_id(user_id)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            return None

    async def delete_user(self, user_id: str) -> bool:
        """Delete user by ID."""
        try:
            result = await self.db.users.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception:
            return False 