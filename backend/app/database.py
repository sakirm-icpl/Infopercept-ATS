from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging
import asyncio

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

async def connect_to_mongo():
    """Create database connection with retry logic."""
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to MongoDB (attempt {attempt + 1}/{max_retries})...")
            Database.client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
            
            # Test the connection
            await Database.client.admin.command('ping')
            
            Database.db = Database.client.get_database()
            
            # Create indexes for unique constraints
            await create_indexes()
            
            logger.info("Successfully connected to MongoDB.")
            return
        except Exception as e:
            logger.error(f"MongoDB connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"Failed to connect to MongoDB after {max_retries} attempts.")
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
        # Allow candidates to apply to multiple jobs - no unique constraint on candidate_id or email
        await Database.db.applications.create_index("candidate_id")
        await Database.db.applications.create_index("email")
        # Ensure unique combination of candidate_id and job_id (one application per job per candidate)
        await Database.db.applications.create_index(
            [("candidate_id", 1), ("job_id", 1)], 
            unique=True
        )
        
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