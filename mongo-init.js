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

// Create sample jobs for testing
print('Creating sample jobs...');

// Check if sample jobs already exist
const sampleJobsExist = db.jobs.findOne({ "title": "Software Engineer" });

if (!sampleJobsExist) {
    const sampleJobs = [
        {
            "_id": ObjectId(),
            "title": "Software Engineer",
            "description": "We are looking for a talented Software Engineer to join our development team. You will be responsible for designing, developing, and maintaining software applications.",
            "requirements": [
                "Bachelor's degree in Computer Science or related field",
                "3+ years of experience in software development",
                "Proficiency in JavaScript, Python, or Java",
                "Experience with modern frameworks (React, Node.js, Django)",
                "Strong problem-solving skills"
            ],
            "responsibilities": [
                "Design and implement software solutions",
                "Collaborate with cross-functional teams",
                "Write clean, maintainable code",
                "Participate in code reviews",
                "Troubleshoot and debug applications"
            ],
            "job_type": "full_time",
            "experience_level": "mid",
            "location": "Mumbai, India",
            "salary_range": "₹8,00,000 - ₹15,00,000 per annum",
            "department": "Engineering",
            "status": "active",
            "skills_required": ["JavaScript", "Python", "React", "Node.js", "MongoDB"],
            "benefits": [
                "Health insurance",
                "Flexible working hours",
                "Professional development",
                "Annual bonus",
                "Remote work options"
            ],
            "posted_by": adminExists ? adminExists._id : ObjectId(),
            "applications_count": 0,
            "created_at": new Date(),
            "updated_at": new Date(),
            "posted_date": new Date()
        },
        {
            "_id": ObjectId(),
            "title": "Marketing Specialist",
            "description": "Join our marketing team as a Marketing Specialist. You will help develop and execute marketing strategies to promote our products and services.",
            "requirements": [
                "Bachelor's degree in Marketing or related field",
                "2+ years of experience in digital marketing",
                "Experience with social media platforms",
                "Knowledge of SEO and content marketing",
                "Excellent communication skills"
            ],
            "responsibilities": [
                "Develop and execute marketing campaigns",
                "Manage social media presence",
                "Create engaging content",
                "Analyze marketing performance",
                "Collaborate with design and content teams"
            ],
            "job_type": "full_time",
            "experience_level": "junior",
            "location": "Delhi, India",
            "salary_range": "₹5,00,000 - ₹8,00,000 per annum",
            "department": "Marketing",
            "status": "active",
            "skills_required": ["Digital Marketing", "Social Media", "SEO", "Content Creation", "Analytics"],
            "benefits": [
                "Health insurance",
                "Performance bonuses",
                "Learning and development",
                "Team events",
                "Work from home"
            ],
            "posted_by": adminExists ? adminExists._id : ObjectId(),
            "applications_count": 0,
            "created_at": new Date(),
            "updated_at": new Date(),
            "posted_date": new Date()
        },
        {
            "_id": ObjectId(),
            "title": "Data Analyst",
            "description": "We are seeking a Data Analyst to help us make data-driven decisions. You will analyze complex data sets and provide insights to support business strategies.",
            "requirements": [
                "Bachelor's degree in Statistics, Mathematics, or related field",
                "2+ years of experience in data analysis",
                "Proficiency in SQL and Python",
                "Experience with data visualization tools",
                "Strong analytical skills"
            ],
            "responsibilities": [
                "Collect and analyze data from various sources",
                "Create reports and dashboards",
                "Identify trends and patterns",
                "Present findings to stakeholders",
                "Support decision-making processes"
            ],
            "job_type": "full_time",
            "experience_level": "mid",
            "location": "Bangalore, India",
            "salary_range": "₹7,00,000 - ₹12,00,000 per annum",
            "department": "Analytics",
            "status": "active",
            "skills_required": ["SQL", "Python", "Excel", "Tableau", "Statistics"],
            "benefits": [
                "Health insurance",
                "Flexible working hours",
                "Professional development",
                "Annual bonus",
                "Remote work options"
            ],
            "posted_by": adminExists ? adminExists._id : ObjectId(),
            "applications_count": 0,
            "created_at": new Date(),
            "updated_at": new Date(),
            "posted_date": new Date()
        }
    ];
    
    const result = db.jobs.insertMany(sampleJobs);
    if (result.insertedIds.length > 0) {
        print('Sample jobs created successfully!');
        print('Created ' + result.insertedIds.length + ' sample jobs');
    } else {
        print('Failed to create sample jobs!');
    }
} else {
    print('Sample jobs already exist, skipping creation.');
}

// Create sample team members and requesters for testing
print('Creating sample team members and requesters...');

const sampleUsersExist = db.users.findOne({ "email": "hr@infopercept.com" });

if (!sampleUsersExist) {
    const sampleUsers = [
        {
            "_id": ObjectId(),
            "username": "hr_manager",
            "email": "hr@infopercept.com",
            "mobile": "9876543210",
            "role": "hr",
            "hashed_password": "$2b$12$TIrO1aoczfxBlaBvGzpo.uREuaIkwJaTElbc97EaNC3IOy9Rrt7q.", // Welcome@ATS
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "_id": ObjectId(),
            "username": "tech_lead",
            "email": "techlead@infopercept.com",
            "mobile": "9876543211",
            "role": "team_member",
            "hashed_password": "$2b$12$TIrO1aoczfxBlaBvGzpo.uREuaIkwJaTElbc97EaNC3IOy9Rrt7q.", // Welcome@ATS
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "_id": ObjectId(),
            "username": "bu_lead",
            "email": "bulead@infopercept.com",
            "mobile": "9876543212",
            "role": "team_member",
            "hashed_password": "$2b$12$TIrO1aoczfxBlaBvGzpo.uREuaIkwJaTElbc97EaNC3IOy9Rrt7q.", // Welcome@ATS
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "_id": ObjectId(),
            "username": "ceo",
            "email": "ceo@infopercept.com",
            "mobile": "9876543213",
            "role": "team_member",
            "hashed_password": "$2b$12$TIrO1aoczfxBlaBvGzpo.uREuaIkwJaTElbc97EaNC3IOy9Rrt7q.", // Welcome@ATS
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "_id": ObjectId(),
            "username": "department_head",
            "email": "department@infopercept.com",
            "mobile": "9876543214",
            "role": "requester",
            "hashed_password": "$2b$12$TIrO1aoczfxBlaBvGzpo.uREuaIkwJaTElbc97EaNC3IOy9Rrt7q.", // Welcome@ATS
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "_id": ObjectId(),
            "username": "candidate1",
            "email": "candidate1@example.com",
            "mobile": "9876543215",
            "role": "candidate",
            "hashed_password": "$2b$12$TIrO1aoczfxBlaBvGzpo.uREuaIkwJaTElbc97EaNC3IOy9Rrt7q.", // Welcome@ATS
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date()
        }
    ];
    
    const result = db.users.insertMany(sampleUsers);
    if (result.insertedIds.length > 0) {
        print('Sample users created successfully!');
        print('Created ' + result.insertedIds.length + ' sample users');
    } else {
        print('Failed to create sample users!');
    }
} else {
    print('Sample users already exist, skipping creation.');
}

print('Database initialization completed successfully!');