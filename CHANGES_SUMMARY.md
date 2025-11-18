# Changes Summary

## Issue Fixed: Stage Feedback Response Mapping

### Problem
Stage 2 and Stage 3 feedback responses were being swapped - Stage 2 was showing Stage 3's data and vice versa.

### Root Cause
The backend model field names didn't match the correct stage order shown on the frontend:
- Frontend shows: Stage 2 = HR Telephonic Interview, Stage 3 = Practical Lab Test
- Backend was storing: Stage 2 = Practical Lab Test, Stage 3 = Technical Interview

### Changes Made

#### 1. Backend Model (`backend/app/models/application.py`)
Updated `ApplicationStages` class to match correct stage order:
- Stage 2: `stage2_hr_telephonic` (HR Telephonic Interview)
- Stage 3: `stage3_practical_lab` (Practical Lab Test)
- Stage 4: `stage4_technical_interview` (Technical Interview)
- Stage 6: `stage6_hr_head_round` (HR Head Round)
- Stage 7: `stage7_ceo_round` (CEO Round)

#### 2. Interview Service (`backend/app/services/interview_service.py`)
Updated all stage feedback submission methods:
- `submit_stage2_feedback`: Now accepts `HRScreening` and stores in `stage2_hr_telephonic`
- `submit_stage3_feedback`: Now accepts `PracticalLabTest` and stores in `stage3_practical_lab`
- `submit_stage4_feedback`: Now accepts `TechnicalInterview` and stores in `stage4_technical_interview`
- `submit_stage6_feedback`: Now accepts `HRRound` and stores in `stage6_hr_head_round`
- `submit_stage7_feedback`: Now accepts `CEOInterview` and stores in `stage7_ceo_round`

Updated `_get_stage_field_name()` method to return correct field names.

#### 3. Interview Routes (`backend/app/routes/interviews.py`)
Updated route handlers to accept correct feedback types for each stage:
- Stage 2: `HRScreening`
- Stage 3: `PracticalLabTest`
- Stage 4: `TechnicalInterview`
- Stage 6: `HRRound`
- Stage 7: `CEOInterview`

## New Feature: HR and Admin Edit Permissions

### Changes Made

#### 1. Feedback Service (`backend/app/services/feedback_service.py`)
- Updated `submit_feedback()`: HR and Admin can now edit feedback without time/count restrictions
- Updated `get_feedback()`: HR and Admin always have `can_edit = True`
- Updated `can_edit_feedback()`: HR and Admin bypass all edit restrictions

#### 2. Frontend Feedback Form (`frontend/src/pages/FeedbackForm.js`)
- Updated Admin/HR view banner to show "Edit Feedback" button
- Changed messaging from "View Only" to "Admin/HR View" with edit capability

### Permissions Summary

**Team Members:**
- Can edit their own feedback within 30 minutes of submission
- Maximum 3 edits allowed
- After restrictions expire, feedback becomes read-only

**HR and Admin:**
- Can edit ANY feedback at ANY time
- No time restrictions
- No edit count restrictions
- Full edit access to all stage feedbacks

## Deployment Instructions

1. Stop the current containers:
   ```bash
   cd Infopercept-ATS
   docker-compose down
   ```

2. Rebuild the backend with no cache:
   ```bash
   docker-compose build --no-cache backend
   ```

3. Rebuild the frontend with no cache:
   ```bash
   docker-compose build --no-cache frontend
   ```

4. Start all services:
   ```bash
   docker-compose up -d
   ```

5. Verify the changes:
   - Check that Stage 2 shows HR Telephonic Interview feedback correctly
   - Check that Stage 3 shows Practical Lab Test feedback correctly
   - Verify HR/Admin users can edit any feedback
   - Verify team members have edit restrictions

## Stage Order Reference

The correct stage order is:
1. Resume Screening
2. HR Telephonic Interview
3. Practical Lab Test
4. Technical Interview
5. BU Lead Round
6. HR Head Round
7. CEO Round

## Files Modified

1. `backend/app/models/application.py`
2. `backend/app/services/interview_service.py`
3. `backend/app/routes/interviews.py`
4. `backend/app/services/feedback_service.py`
5. `frontend/src/pages/FeedbackForm.js`

## Testing Checklist

- [ ] Stage 2 feedback displays correctly (HR Telephonic Interview data)
- [ ] Stage 3 feedback displays correctly (Practical Lab Test data)
- [ ] All other stages display correct data
- [ ] HR users can edit any feedback
- [ ] Admin users can edit any feedback
- [ ] Team members can edit within 30-minute window
- [ ] Team members cannot edit after restrictions expire
- [ ] Edit count increments correctly
- [ ] Feedback metadata shows edit history
