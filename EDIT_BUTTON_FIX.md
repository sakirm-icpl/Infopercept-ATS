# Edit Button Fix for HR/Admin Users

## Issue
HR and Admin users were not seeing an "Edit Feedback" button in the feedback view modal.

## Root Cause
The `FeedbackViewModal` component was a read-only view without any edit functionality. The edit feature exists in the `FeedbackForm` page, but there was no way to navigate to it from the modal.

## Solution
Added an "Edit Feedback" button to the `FeedbackViewModal` component that:
1. Checks if the current user is HR or Admin
2. Shows an "Edit Feedback" button for HR/Admin users
3. Navigates to the feedback form page when clicked

## Changes Made

### 1. FeedbackViewModal.js
- Added imports: `Edit` icon, `useNavigate`, `useAuth`
- Added `applicationId` prop
- Added `canEdit` check for HR/Admin users
- Added `handleEdit` function to navigate to feedback form
- Added "Edit Feedback" button in the action buttons section

### 2. ApplicationDetail.js
- Passed `applicationId={id}` prop to `FeedbackViewModal`

## How It Works

1. **HR/Admin View Feedback**:
   - Click "View Full Feedback" on any completed stage
   - Modal opens showing the feedback details
   - "Edit Feedback" button is visible at the bottom right

2. **Click Edit**:
   - Modal closes
   - User is redirected to `/app/applications/{id}/feedback/{stageNumber}`
   - Feedback form opens with existing data pre-filled
   - User can edit and save changes

3. **Permissions**:
   - HR and Admin: Can edit any feedback at any time
   - Team Members: Can only edit their own feedback within 30 minutes (max 3 edits)

## Testing

### Test as HR/Admin:
1. ✅ Login as HR or Admin user
2. ✅ Navigate to an application with completed stages
3. ✅ Click "View Full Feedback" on any stage
4. ✅ Verify "Edit Feedback" button appears at bottom right
5. ✅ Click "Edit Feedback"
6. ✅ Verify you're redirected to the feedback form
7. ✅ Verify existing feedback is pre-filled
8. ✅ Make changes and save
9. ✅ Verify changes are saved successfully

### Test as Team Member:
1. ✅ Login as Team Member
2. ✅ View feedback for a stage you submitted
3. ✅ Verify "Edit Feedback" button only appears if within edit window
4. ✅ After 30 minutes or 3 edits, button should not appear

## Deployment

Changes have been deployed:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Files Modified
1. `frontend/src/components/FeedbackViewModal.js`
2. `frontend/src/pages/ApplicationDetail.js`

## UI Changes

**Before:**
- Modal showed feedback with only a "Close" button
- No way to edit from the modal

**After:**
- Modal shows feedback with "Close" and "Edit Feedback" buttons (for HR/Admin)
- Clicking "Edit Feedback" navigates to the feedback form page
- Edit button only visible to HR/Admin users

## Status
✅ **DEPLOYED AND READY TO TEST**

Access the application at: http://localhost:3000
