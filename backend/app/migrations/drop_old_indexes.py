"""
Migration script to drop old unique indexes on candidate_id and email
that prevent candidates from applying to multiple jobs.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def drop_old_indexes():
    """Drop old unique indexes from applications collection."""
    # Get MongoDB connection string from environment
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://mongodb:27017/ats_db")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongodb_url)
    db = client.get_database()
    
    print("Connected to MongoDB")
    
    try:
        # Get existing indexes
        indexes = await db.applications.index_information()
        print(f"Current indexes: {list(indexes.keys())}")
        
        # Drop the old unique indexes if they exist
        if "candidate_id_1" in indexes:
            print("Dropping candidate_id_1 index...")
            await db.applications.drop_index("candidate_id_1")
            print("✓ Dropped candidate_id_1 index")
        else:
            print("candidate_id_1 index not found (already dropped or never existed)")
        
        if "email_1" in indexes:
            print("Dropping email_1 index...")
            await db.applications.drop_index("email_1")
            print("✓ Dropped email_1 index")
        else:
            print("email_1 index not found (already dropped or never existed)")
        
        # List remaining indexes
        indexes_after = await db.applications.index_information()
        print(f"\nRemaining indexes: {list(indexes_after.keys())}")
        
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Error during migration: {e}")
        raise e
    finally:
        client.close()
        print("Closed MongoDB connection")

if __name__ == "__main__":
    asyncio.run(drop_old_indexes())
