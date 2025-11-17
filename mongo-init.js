// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'ats_db');

// Create collections and indexes
print('Creating collections and indexes...');

// Users collection
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "mobile": 1 }, { unique: true });

// Applications collection
db.createCollection('applications');
db.applications.createIndex({ "candidate_id": 1, "job_id": 1 }, { unique: true });
db.applications.createIndex({ "email": 1, "job_id": 1 }, { unique: true });

// Jobs collection
db.createCollection('jobs');
db.jobs.createIndex({ "title": 1 });
db.jobs.createIndex({ "department": 1 });
db.jobs.createIndex({ "status": 1 });
db.jobs.createIndex({ "posted_by": 1 });

// Candidates collection
db.createCollection('candidates');
db.candidates.createIndex({ "user_id": 1 }, { unique: true });

// Stage assignments collection
db.createCollection('stage_assignments');
db.stage_assignments.createIndex({ "application_id": 1, "stage_number": 1 });
db.stage_assignments.createIndex({ "assigned_to": 1 });

// Create default admin user
print('Creating default admin user...');

// Check if admin user already exists
const adminExists = db.users.findOne({ "email": "admin@infopercept.com" });

if (!adminExists) {
    // Create admin user with hashed password (password: Welcome@ATS)
    // This is a bcrypt hash of "Welcome@ATS"
    const adminUser = {
        "_id": ObjectId(),
        "username": "admin",
        "email": "admin@infopercept.com",
        "mobile": "9999999999",
        "role": "admin",
        "hashed_password": "$2b$12$TIrO1aoczfxBlaBvGzpo.uREuaIkwJaTElbc97EaNC3IOy9Rrt7q.",
        "is_active": true,
        "created_at": new Date(),
        "updated_at": new Date()
    };
    
    const result = db.users.insertOne(adminUser);
    if (result.insertedId) {
        print('Default admin user created successfully!');
        print('Email: admin@infopercept.com');
        print('Password: Welcome@ATS');
        print('User ID: ' + result.insertedId);
    } else {
        print('Failed to create admin user!');
    }
} else {
    print('Admin user already exists, skipping creation.');
}

// Note: Sample jobs and users are not created during initialization
// Admin can create additional users and jobs through the application interface

print('Database initialization completed successfully!');