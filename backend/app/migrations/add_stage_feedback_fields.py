"""
Migration script to add stage feedback and assignment fields to existing applications.

This migration:
1. Adds stage{N}_status field to existing applications (default: "pending")
2. Creates stage_assignments collection with indexes
3. Adds indexes on assigned_to fields in applications collection
"""

import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def migrate_applications(db):
    """Add stage status and feedback fields to existing applications."""
    logger.info("Starting migration: Adding stage feedback fields to applications...")
    
    try:
        # Update all existing applications to add stage status fields if they don't exist
        result = await db.applications.update_many(
            {},
            {
                "$set": {
                    "stages.stage1_status": "pending",
                    "stages.stage2_status": "pending",
                    "stages.stage3_status": "pending",
                    "stages.stage4_status": "pending",
                    "stages.stage5_status": "pending",
                    "stages.stage6_status": "pending",
                    "stages.stage7_status": "pending",
                }
            }
        )
        
        logger.info(f"Updated {result.modified_count} applications with stage status fields")
        
        # Initialize feedback fields as null (they will be set when feedback is submitted)
        result = await db.applications.update_many(
            {},
            {
                "$set": {
                    "stages.stage1_feedback": None,
                    "stages.stage2_feedback": None,
                    "stages.stage3_feedback": None,
                    "stages.stage4_feedback": None,
                    "stages.stage5_feedback": None,
                    "stages.stage6_feedback": None,
                    "stages.stage7_feedback": None,
                }
            }
        )
        
        logger.info(f"Initialized feedback fields for {result.modified_count} applications")
        
    except Exception as e:
        logger.error(f"Error migrating applications: {e}")
        raise


async def create_stage_assignments_collection(db):
    """Create stage_assignments collection with indexes."""
    logger.info("Creating stage_assignments collection and indexes...")
    
    try:
        # Create the collection if it doesn't exist
        collections = await db.list_collection_names()
        if "stage_assignments" not in collections:
            await db.create_collection("stage_assignments")
            logger.info("Created stage_assignments collection")
        
        # Create indexes for stage_assignments collection
        await db.stage_assignments.create_index(
            [("application_id", 1), ("stage_number", 1)],
            name="application_stage_idx"
        )
        logger.info("Created index on (application_id, stage_number)")
        
        await db.stage_assignments.create_index(
            [("assigned_to", 1), ("status", 1)],
            name="assigned_to_status_idx"
        )
        logger.info("Created index on (assigned_to, status)")
        
        await db.stage_assignments.create_index(
            "assigned_by",
            name="assigned_by_idx"
        )
        logger.info("Created index on assigned_by")
        
        await db.stage_assignments.create_index(
            "deadline",
            name="deadline_idx"
        )
        logger.info("Created index on deadline")
        
    except Exception as e:
        logger.error(f"Error creating stage_assignments collection: {e}")
        raise


async def create_application_indexes(db):
    """Add indexes on assigned_to fields in applications collection."""
    logger.info("Creating indexes on assigned_to fields in applications collection...")
    
    try:
        # Create indexes for each stage's assigned_to field
        for stage_num in range(1, 8):
            await db.applications.create_index(
                f"stages.stage{stage_num}_assigned_to",
                name=f"stage{stage_num}_assigned_to_idx"
            )
            logger.info(f"Created index on stages.stage{stage_num}_assigned_to")
        
    except Exception as e:
        logger.error(f"Error creating application indexes: {e}")
        raise


async def run_migration():
    """Run all migration steps."""
    logger.info("=" * 60)
    logger.info("Starting Stage Feedback and Assignment Migration")
    logger.info("=" * 60)
    
    client = None
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client.get_database()
        logger.info(f"Connected to MongoDB: {settings.mongodb_url}")
        
        # Run migration steps
        await migrate_applications(db)
        await create_stage_assignments_collection(db)
        await create_application_indexes(db)
        
        logger.info("=" * 60)
        logger.info("Migration completed successfully!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        if client:
            client.close()
            logger.info("Closed MongoDB connection")


if __name__ == "__main__":
    asyncio.run(run_migration())
