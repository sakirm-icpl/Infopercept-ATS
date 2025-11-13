# Database Hierarchy Guide - ATS System

## Overview

Your ATS (Applicant Tracking System) uses MongoDB as the database with the name `ats_db`. The system follows a document-based structure with collections representing different entities in the hiring process.

## Database: `ats_db`

### 📊 Collections Overview

```
ats_db/
├── users/           # User accounts and authentication
├── jobs/            # Job postings and requirements
├── applications/    # Job applications and interview stages
└── candidates/      # Candidate profiles (future enhancement)
```

---

## 1. 📋 USERS Collection

### Purpose
Stores all user accounts including candidates, HR managers, and administrators.

### Document Structure
```json
{
  "_id": "ObjectId",
  "username": "string (3-50 chars, unique)",
  "email": "string (email format, unique)",
  "mobile": "string (10-15 chars, unique)",
  "role": "enum (admin|hr|candidate)",
  "hashed_password": "string (bcrypt hashed)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "is_active": "boolean (default: true)"
}
```

### Indexes
- `email` (unique)
- `username` (unique)
- `mobile` (unique)

### User Roles
1. **ADMIN** - System administrators with full access
2. **HR** - HR managers who can manage jobs and applications
3. **CANDIDATE** - Job seekers who can apply for positions

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john.doe@example.com",
  "mobile": "1234567890",
  "role": "candidate",
  "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "is_active": true
}
```

---

## 2. 💼 JOBS Collection

### Purpose
Stores job postings with detailed requirements, responsibilities, and metadata.

### Document Structure
```json
{
  "_id": "ObjectId",
  "title": "string (1-200 chars)",
  "description": "string (10-2000 chars)",
  "requirements": ["array of strings"],
  "responsibilities": ["array of strings"],
  "job_type": "enum (full_time|part_time|contract|internship)",
  "experience_level": "enum (entry|junior|mid|senior|lead|manager)",
  "location": "string (max 100 chars)",
  "salary_range": "string (optional, max 100 chars)",
  "department": "string (max 100 chars)",
  "status": "enum (active|inactive|closed)",
  "skills_required": ["array of strings"],
  "benefits": ["array of strings"],
  "posted_by": "string (User ID)",
  "applications_count": "integer (default: 0)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "posted_date": "datetime",
  "closing_date": "datetime (optional)"
}
```

### Indexes
- `title` (text search)
- `department` (for filtering)
- `status` (for filtering)
- `posted_by` (for user's jobs)

### Job Statuses
1. **ACTIVE** - Job is open for applications
2. **INACTIVE** - Job is temporarily paused
3. **CLOSED** - Job is no longer accepting applications

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Senior Software Engineer",
  "description": "We are looking for a talented Senior Software Engineer...",
  "requirements": [
    "5+ years of experience in software development",
    "Proficiency in Python, JavaScript, and React",
    "Experience with cloud platforms (AWS/Azure)"
  ],
  "responsibilities": [
    "Design and implement scalable software solutions",
    "Collaborate with cross-functional teams",
    "Mentor junior developers"
  ],
  "job_type": "full_time",
  "experience_level": "senior",
  "location": "Remote",
  "salary_range": "$80,000 - $120,000",
  "department": "Engineering",
  "status": "active",
  "skills_required": ["Python", "JavaScript", "React", "AWS"],
  "benefits": ["Health Insurance", "401k", "Remote Work"],
  "posted_by": "507f1f77bcf86cd799439011",
  "applications_count": 5,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "posted_date": "2024-01-15T10:30:00.000Z",
  "closing_date": "2024-02-15T10:30:00.000Z"
}
```

---

## 3. 📝 APPLICATIONS Collection

### Purpose
Stores job applications with a comprehensive 6-stage interview process tracking system.

### Document Structure
```json
{
  "_id": "ObjectId",
  "name": "string (max 100 chars)",
  "email": "string (email format)",
  "mobile": "string (10-15 chars)",
  "job_id": "string (Job ID reference)",
  "date_of_application": "datetime",
  "resume_filename": "string (optional)",
  "candidate_id": "string (User ID reference)",
  "stages": {
    "stage1_hr_screening": {
      "panel_name": "enum (Muskan|Vidhi|Komal|Nikita)",
      "panel_feedback": "string (max 500 chars)",
      "mcq_test_score": "integer (0-100, optional)",
      "panel_comments": "string (max 500 chars)",
      "communication_skills": "enum (Poor|Average|Good|Excellent)",
      "scale": "integer (1-10)",
      "reason_for_scale": "string (max 500 chars)",
      "outcome": "enum (Yes|No)",
      "completed_at": "datetime (optional)"
    },
    "stage2_practical_lab": {
      "panel_name": "string (max 100 chars)",
      "completion_status": "enum (Complete|Incomplete)",
      "reviewer_comments": "string (max 500 chars)",
      "test_result": "enum (Pass|Fail)",
      "completed_at": "datetime (optional)"
    },
    "stage3_technical_interview": {
      "panel_name": "string (max 100 chars)",
      "feedback": "string (max 1000 chars)",
      "scale": "integer (1-10)",
      "reason_for_scale": "string (max 500 chars)",
      "outcome": "enum (Yes|No)",
      "completed_at": "datetime (optional)"
    },
    "stage4_hr_round": {
      "panel_name": "string (max 100 chars)",
      "feedback": "string (max 1000 chars)",
      "scale": "integer (1-10)",
      "reason_for_scale": "string (max 500 chars)",
      "outcome": "enum (Yes|No)",
      "communication_rating": "integer (1-5)",
      "cultural_fit_rating": "integer (1-5)",
      "passion_rating": "integer (1-5)",
      "leadership_potential_rating": "integer (1-5)",
      "learning_agility_rating": "integer (1-5)",
      "completed_at": "datetime (optional)"
    },
    "stage5_bu_lead_interview": {
      "panel_name": "string (max 100 chars)",
      "feedback": "string (max 1000 chars)",
      "scale": "integer (1-10)",
      "reason_for_scale": "string (max 500 chars)",
      "outcome": "enum (Yes|No)",
      "completed_at": "datetime (optional)"
    },
    "stage6_ceo_interview": {
      "panel_name": "string (max 100 chars)",
      "feedback": "string (max 1000 chars)",
      "scale": "integer (1-10)",
      "reason_for_scale": "string (max 500 chars)",
      "outcome": "enum (Yes|No)",
      "completed_at": "datetime (optional)"
    },
    "final_recommendation": {
      "status": "enum (Select|Hold|Reject)",
      "cumulative_scale": "integer (1-10)",
      "suggestions": "string (max 1000 chars)",
      "completed_at": "datetime (optional)"
    }
  },
  "current_stage": "integer (1-6)",
  "status": "string (default: pending)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Indexes
- `candidate_id` + `job_id` (unique compound)
- `email` + `job_id` (unique compound)

### Interview Stages
1. **Stage 1: HR Screening** - Initial screening with MCQ test
2. **Stage 2: Practical Lab Test** - Hands-on technical assessment
3. **Stage 3: Technical Interview** - Technical skills evaluation
4. **Stage 4: HR Round** - Cultural fit and soft skills assessment
5. **Stage 5: BU Lead Interview** - Business unit leader evaluation
6. **Stage 6: CEO Interview** - Final executive review

### Sample Document
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobile": "1234567890",
  "job_id": "507f1f77bcf86cd799439012",
  "date_of_application": "2024-01-16T09:00:00.000Z",
  "resume_filename": "john_doe_resume.pdf",
  "candidate_id": "507f1f77bcf86cd799439011",
  "stages": {
    "stage1_hr_screening": {
      "panel_name": "Muskan",
      "panel_feedback": "Good communication skills, relevant experience",
      "mcq_test_score": 85,
      "panel_comments": "Candidate shows strong technical foundation",
      "communication_skills": "Good",
      "scale": 8,
      "reason_for_scale": "Excellent problem-solving approach",
      "outcome": "Yes",
      "completed_at": "2024-01-17T14:30:00.000Z"
    },
    "stage2_practical_lab": {
      "panel_name": "Tech Lead",
      "completion_status": "Complete",
      "reviewer_comments": "Successfully completed all tasks",
      "test_result": "Pass",
      "completed_at": "2024-01-18T16:00:00.000Z"
    }
  },
  "current_stage": 3,
  "status": "in_progress",
  "created_at": "2024-01-16T09:00:00.000Z",
  "updated_at": "2024-01-18T16:00:00.000Z"
}
```

---

## 4. 👤 CANDIDATES Collection (Future Enhancement)

### Purpose
Will store additional candidate profile information beyond basic user data.

### Document Structure (Planned)
```json
{
  "_id": "ObjectId",
  "user_id": "string (User ID reference, unique)",
  "profile_data": {
    "education": ["array of education records"],
    "experience": ["array of work experience"],
    "skills": ["array of skills"],
    "certifications": ["array of certifications"]
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Indexes
- `user_id` (unique)

---

## 🔗 Data Relationships

### Primary Relationships
1. **Users → Jobs**: `posted_by` field in jobs references user ID
2. **Users → Applications**: `candidate_id` field in applications references user ID
3. **Jobs → Applications**: `job_id` field in applications references job ID

### Relationship Diagram
```
USERS (1) ←→ (N) JOBS
  ↓
  ↓ (1)
APPLICATIONS (N) ←→ (1) JOBS
```

### Foreign Key References
- `jobs.posted_by` → `users._id`
- `applications.candidate_id` → `users._id`
- `applications.job_id` → `jobs._id`

---

## 📈 Data Flow

### 1. User Registration
```
User registers → users collection → user account created
```

### 2. Job Posting
```
HR/Admin creates job → jobs collection → job available for applications
```

### 3. Job Application
```
Candidate applies → applications collection → application enters stage 1
```

### 4. Interview Process
```
Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5 → Stage 6 → Final Recommendation
```

### 5. Application Status Updates
```
pending → in_progress → completed (with final status)
```

---

## 🔍 Common Queries

### Find All Active Jobs
```javascript
db.jobs.find({ "status": "active" })
```

### Find Applications for a Specific Job
```javascript
db.applications.find({ "job_id": "job_id_here" })
```

### Find User's Applications
```javascript
db.applications.find({ "candidate_id": "user_id_here" })
```

### Find Applications in Specific Stage
```javascript
db.applications.find({ "current_stage": 3 })
```

### Find Users by Role
```javascript
db.users.find({ "role": "hr" })
```

---

## 🛡️ Data Integrity

### Unique Constraints
- Email addresses (users)
- Usernames (users)
- Mobile numbers (users)
- One application per candidate per job
- One application per email per job

### Validation Rules
- Email format validation
- Password minimum length (6 characters)
- Mobile number length (10-15 characters)
- Required fields validation
- Enum value validation

### Indexes for Performance
- Text search on job titles
- Filtering by department, status
- User lookup by email
- Application lookup by candidate and job

---

## 📊 Analytics Opportunities

### Key Metrics
1. **Application Success Rate**: Applications reaching final stage
2. **Stage-wise Dropout Rate**: Candidates dropping at each stage
3. **Time to Hire**: Average time from application to final decision
4. **Department-wise Hiring**: Jobs and applications by department
5. **Interviewer Performance**: Success rates by panel members

### Sample Analytics Queries
```javascript
// Applications by status
db.applications.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Average stage completion time
db.applications.aggregate([
  { $match: { "stages.stage1_hr_screening.completed_at": { $exists: true } } },
  { $project: { 
    time_to_stage1: { 
      $subtract: ["$stages.stage1_hr_screening.completed_at", "$created_at"] 
    } 
  } },
  { $group: { _id: null, avg_time: { $avg: "$time_to_stage1" } } }
])
```

This database structure provides a comprehensive foundation for managing the entire hiring process from job posting to final candidate selection. 