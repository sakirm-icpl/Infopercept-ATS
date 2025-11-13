# Database Migrations

This directory contains database migration scripts for the ATS system.

## Running Migrations

### Stage Feedback and Assignment Migration

This migration adds support for the stage assignment and feedback system.

**What it does:**
1. Adds `stage{N}_status` fields to all existing applications (default: "pending")
2. Initializes `stage{N}_feedback` fields as null
3. Creates the `stage_assignments` collection for audit trail
4. Creates indexes on assigned_to fields for performance
5. Creates indexes on the stage_assignments collection

**To run the migration:**

```bash
# From the backend directory
cd backend

# Run the migration script
python -m app.migrations.add_stage_feedback_fields
```

**Prerequisites:**
- MongoDB must be running
- Environment variables must be configured (MONGODB_URL)
- The application database must exist

**Rollback:**
If you need to rollback this migration, you can manually remove the fields:

```javascript
// Connect to MongoDB and run:
db.applications.updateMany(
  {},
  {
    $unset: {
      "stages.stage1_status": "",
      "stages.stage2_status": "",
      "stages.stage3_status": "",
      "stages.stage4_status": "",
      "stages.stage5_status": "",
      "stages.stage6_status": "",
      "stages.stage7_status": "",
      "stages.stage1_feedback": "",
      "stages.stage2_feedback": "",
      "stages.stage3_feedback": "",
      "stages.stage4_feedback": "",
      "stages.stage5_feedback": "",
      "stages.stage6_feedback": "",
      "stages.stage7_feedback": ""
    }
  }
);

// Drop the stage_assignments collection
db.stage_assignments.drop();

// Drop the indexes
db.applications.dropIndex("stage1_assigned_to_idx");
db.applications.dropIndex("stage2_assigned_to_idx");
db.applications.dropIndex("stage3_assigned_to_idx");
db.applications.dropIndex("stage4_assigned_to_idx");
db.applications.dropIndex("stage5_assigned_to_idx");
db.applications.dropIndex("stage6_assigned_to_idx");
db.applications.dropIndex("stage7_assigned_to_idx");
```

## Migration Best Practices

1. **Always backup your database before running migrations**
2. Test migrations in a development environment first
3. Run migrations during low-traffic periods
4. Monitor the migration progress and logs
5. Have a rollback plan ready

## Future Migrations

Add new migration scripts to this directory following the naming convention:
- `<description_of_migration>.py`
- Include a docstring explaining what the migration does
- Add documentation to this README
