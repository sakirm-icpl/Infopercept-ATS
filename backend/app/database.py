from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

async def connect_to_mongo():
    """Create database connection."""
    try:
        Database.client = AsyncIOMotorClient(settings.mongodb_url)
        Database.db = Database.client.get_database()
        
        # Create indexes for unique constraints
        await create_indexes()
        
        logger.info("Connected to MongoDB.")
    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    """Close database connection."""
    if Database.client:
        Database.client.close()
        logger.info("Closed MongoDB connection.")

async def create_indexes():
    """Create database indexes for performance and constraints."""
    try:
        # Users collection indexes
        await Database.db.users.create_index("email", unique=True)
        await Database.db.users.create_index("username", unique=True)
        await Database.db.users.create_index("mobile", unique=True)
        
        # Applications collection indexes
        await Database.db.applications.create_index("candidate_id", unique=True)
        await Database.db.applications.create_index("email", unique=True)
        
        # Stage assignment indexes on applications collection
        for stage_num in range(1, 8):
            await Database.db.applications.create_index(
                f"stages.stage{stage_num}_assigned_to"
            )
        
        # Candidates collection indexes
        await Database.db.candidates.create_index("user_id", unique=True)
        
        # Stage assignments collection indexes
        await Database.db.stage_assignments.create_index(
            [("application_id", 1), ("stage_number", 1)]
        )
        await Database.db.stage_assignments.create_index(
            [("assigned_to", 1), ("status", 1)]
        )
        await Database.db.stage_assignments.create_index("assigned_by")
        await Database.db.stage_assignments.create_index("deadline")
        
        # Notifications collection indexes
        await Database.db.notifications.create_index(
            [("user_id", 1), ("is_read", 1)]
        )
        await Database.db.notifications.create_index(
            [("user_id", 1), ("created_at", -1)]
        )
        await Database.db.notifications.create_index("application_id")
        
        logger.info("Database indexes created successfully.")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise e

def get_database() -> AsyncIOMotorClient:
    """Get database instance."""
    return Database.db 