"""
Migration: Fix candidate_id unique index to allow multiple applications per candidate

This migration:
1. Drops the incorrect unique index on candidate_id
2. Creates a compound unique index on (candidate_id, job_id) to prevent duplicate applications for the same job
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os


async def run_migration():
    """Run the migration to fix the candidate_id index."""
    
    # Get MongoDB connection details from environment
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://mongodb:27017")
    database_name = os.getenv("DATABASE_NAME", "ats_db")
    
    print(f"Connecting to MongoDB at {mongodb_url}")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    try:
        # Get the applications collection
        applications = db.applications
        
        print("\n=== Starting Migration ===")
        
        # Step 1: List current indexes
        print("\n1. Current indexes:")
        indexes = await applications.list_indexes().to_list(length=None)
        for idx in indexes:
            print(f"   - {idx['name']}: {idx.get('key', {})}")
        
        # Step 2: Drop the incorrect unique index on candidate_id
        print("\n2. Dropping incorrect unique index on candidate_id...")
        try:
            await applications.drop_index("candidate_id_1")
            print("   ✓ Successfully dropped candidate_id_1 index")
        except Exception as e:
            if "index not found" in str(e).lower():
                print("   ℹ Index candidate_id_1 not found (already removed)")
            else:
                print(f"   ⚠ Error dropping index: {e}")
        
        # Step 3: Drop the incorrect unique index on email
        print("\n3. Dropping incorrect unique index on email...")
        try:
            await applications.drop_index("email_1")
            print("   ✓ Successfully dropped email_1 index")
        except Exception as e:
            if "index not found" in str(e).lower():
                print("   ℹ Index email_1 not found (already removed)")
            else:
                print(f"   ⚠ Error dropping index: {e}")
        
        # Step 4: Create compound unique index on (candidate_id, job_id)
        print("\n4. Creating compound unique index on (candidate_id, job_id)...")
        try:
            await applications.create_index(
                [("candidate_id", 1), ("job_id", 1)],
                unique=True,
                name="candidate_job_unique"
            )
            print("   ✓ Successfully created candidate_job_unique index")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("   ℹ Index candidate_job_unique already exists")
            else:
                print(f"   ⚠ Error creating index: {e}")
        
        # Step 5: List indexes after migration
        print("\n5. Indexes after migration:")
        indexes = await applications.list_indexes().to_list(length=None)
        for idx in indexes:
            print(f"   - {idx['name']}: {idx.get('key', {})}")
        
        print("\n=== Migration Complete ===\n")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Fix Candidate Unique Index Migration")
    print("=" * 60)
    asyncio.run(run_migration())
