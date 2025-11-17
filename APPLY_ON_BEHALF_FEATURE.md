# Apply on Behalf Feature

## Overview
This feature allows HR and Admin users to submit job applications on behalf of registered candidates. This is useful for scenarios where HR wants to proactively match candidates with suitable positions.

## Implementation

### Backend Changes

#### 1. New API Endpoint
**File**: `backend/app/routes/applications.py`

Added new endpoint: `POST /api/applications/apply-on-behalf`

**Parameters**:
- `candidate_id` (Form): ID of the candidate to apply on behalf of
- `job_id` (Form): ID of the job to apply for
- `resume` (File, Optional): Resume file to upload

**Authorization**: HR or Admin only

**Functionality**:
- Validates that the selected user is a candidate
- Retrieves candidate information (name, email, mobile) from user profile
- Creates application with current timestamp
- Optionally uploads resume file
- Returns created application

#### 2. Get Candidates Endpoint
**File**: `backend/app/routes/users.py`

Added new endpoint: `GET /api/users/candidates`

**Authorization**: HR or Admin only

**Returns**: List of all users with role "candidate"

### Frontend Changes

#### 1. Apply on Behalf Modal Component
**File**: `frontend/src/components/ApplyOnBehalfModal.js`

New modal component with:
- Dropdown to select candidate from list
- Display of job title being applied for
- Optional resume upload
- Form validation
- Success/error messaging

**Features**:
- Fetches all candidates on modal open
- Validates file size (max 5MB) and type (PDF/DOC)
- Shows candidate username and email in dropdown
- Displays success message and auto-closes after submission

#### 2. Job Detail Page Updates
**File**: `frontend/src/pages/JobDetail.js`

Added:
- "Apply on Behalf" button for HR/Admin (only for active jobs)
- Import and integration of ApplyOnBehalfModal component
- State management for modal visibility

**Button Placement**: First button in the action buttons row (green gradient)

## User Flow

### For HR/Admin:

1. **Navigate to Job Detail Page**
   - Go to Job Management → Select any active job
   - Or browse jobs and click on a job

2. **Click "Apply on Behalf" Button**
   - Green button with UserPlus icon
   - Only visible for active jobs
   - Only visible to HR and Admin users

3. **Select Candidate**
   - Modal opens showing job title
   - Dropdown lists all registered candidates
   - Shows candidate name and email

4. **Upload Resume (Optional)**
   - Click to select PDF or DOC file
   - Max 5MB file size
   - File name displayed after selection

5. **Submit Application**
   - Click "Submit Application" button
   - Success message appears
   - Modal auto-closes after 2 seconds
   - Application is created with candidate's information

### For Candidates:

- Candidates will see the application in their "My Applications" page
- Application appears as if they submitted it themselves
- All application details use candidate's profile information
- Candidates can track progress normally

## Security

- **Authorization**: Only HR and Admin can access the apply-on-behalf endpoint
- **Validation**: 
  - Verifies selected user is actually a candidate
  - Checks if candidate already applied to the job
  - Validates file types and sizes
- **Data Integrity**: Uses candidate's actual profile data (name, email, mobile)

## API Endpoints Summary

| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/applications/apply-on-behalf` | POST | HR, Admin | Submit application on behalf of candidate |
| `/api/users/candidates` | GET | HR, Admin | Get list of all candidates |

## Files Modified

### Backend:
1. `backend/app/routes/applications.py` - Added apply-on-behalf endpoint
2. `backend/app/routes/users.py` - Added get candidates endpoint

### Frontend:
1. `frontend/src/components/ApplyOnBehalfModal.js` - New modal component
2. `frontend/src/pages/JobDetail.js` - Added button and modal integration

## Testing

To test the feature:

1. **Login as HR or Admin**
2. **Navigate to any active job**
3. **Click "Apply on Behalf" button**
4. **Select a candidate from dropdown**
5. **Optionally upload a resume**
6. **Submit the application**
7. **Verify**:
   - Success message appears
   - Application appears in Applications list
   - Candidate can see it in their "My Applications"
   - Application uses candidate's profile information

## Benefits

- **Proactive Recruitment**: HR can match candidates with suitable positions
- **Streamlined Process**: No need for candidates to manually apply
- **Bulk Application**: HR can quickly apply multiple candidates to positions
- **Better Candidate Management**: HR has more control over the application process
- **Time Saving**: Reduces manual work for both HR and candidates

## Future Enhancements

Potential improvements:
- Bulk apply (select multiple candidates at once)
- Add notes/comments when applying on behalf
- Notify candidate via email when applied on their behalf
- Filter candidates by skills/experience
- Show if candidate already applied to the job
- Application history tracking (who applied on behalf)
