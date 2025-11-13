# Test Verification Guide - Infopercept ATS

## 🧪 Complete System Testing

This guide provides step-by-step instructions to verify all functionality is working correctly.

---

## Prerequisites

✅ Docker and Docker Compose installed  
✅ All services running (`docker-compose up -d`)  
✅ All containers healthy (`docker-compose ps`)

---

## Test 1: Service Health Check

### Verify All Services Are Running
```bash
docker-compose ps
```

**Expected Output:**
- ✅ ats_mongodb - healthy
- ✅ ats_backend - healthy
- ✅ ats_frontend - healthy
- ✅ ats_mongo_express - healthy

### Check Service Logs
```bash
# Backend logs
docker-compose logs backend | tail -20

# Frontend logs
docker-compose logs frontend | tail -20

# MongoDB logs
docker-compose logs mongodb | tail -20
```

**Expected:** No error messages, services started successfully

---

## Test 2: Frontend Access

### Access Main Application
1. Open browser: http://localhost:3000
2. **Expected:** Home page loads with Infopercept branding
3. **Verify:**
   - ✅ Navigation menu visible
   - ✅ "Get Started" and "Sign In" buttons present
   - ✅ Features section displays
   - ✅ Footer visible
   - ✅ No console errors (F12 → Console)

### Check Responsive Design
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes
4. **Expected:** Layout adapts properly

---

## Test 3: Backend API

### Access API Documentation
1. Open browser: http://localhost:8000/docs
2. **Expected:** Swagger UI loads
3. **Verify:**
   - ✅ All endpoint groups visible (Auth, Users, Jobs, Applications, Interviews)
   - ✅ Can expand endpoint details
   - ✅ Schemas section present

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "ATS API is running"
}
```

---

## Test 4: Database Connection

### Access Mongo Express
1. Open browser: http://localhost:8081
2. Login:
   - Username: `admin`
   - Password: `admin`
3. **Expected:** Database management UI loads
4. **Verify:**
   - ✅ `ats_db` database visible
   - ✅ Collections present: users, jobs, applications, stage_assignments
   - ✅ Can view collection data

### Verify Sample Data
1. Click on `ats_db` database
2. Click on `users` collection
3. **Expected:** 7 users visible
4. Click on `jobs` collection
5. **Expected:** 3 sample jobs visible

---

## Test 5: Authentication Flow

### Test Admin Login
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: `admin@infopercept.com`
   - Password: `Welcome@ATS`
3. Click "Sign In"
4. **Expected:**
   - ✅ Redirects to `/app/dashboard`
   - ✅ Dashboard loads with admin view
   - ✅ "Admin Dashboard" title visible
   - ✅ User menu shows admin username
   - ✅ Navigation sidebar visible

### Test HR Login
1. Logout (click user menu → Logout)
2. Login with:
   - Email: `hr@infopercept.com`
   - Password: `Welcome@ATS`
3. **Expected:**
   - ✅ Redirects to HR dashboard
   - ✅ "HR Dashboard" title visible
   - ✅ Different quick actions than admin

### Test Team Member Login
1. Logout
2. Login with:
   - Email: `techlead@infopercept.com`
   - Password: `Welcome@ATS`
3. **Expected:**
   - ✅ Redirects to team member dashboard
   - ✅ "Interview Dashboard" title visible
   - ✅ "My Assignments" link visible

### Test Candidate Login
1. Logout
2. Login with:
   - Email: `candidate1@example.com`
   - Password: `Welcome@ATS`
3. **Expected:**
   - ✅ Redirects to candidate dashboard
   - ✅ "Your Career Journey" title visible
   - ✅ "Browse Open Positions" link visible

### Test Invalid Login
1. Logout
2. Try to login with:
   - Email: `invalid@example.com`
   - Password: `wrongpassword`
3. **Expected:**
   - ✅ Error message: "Email not found" or "Incorrect password"
   - ✅ Stays on login page
   - ✅ No redirect

---

## Test 6: User Management (Admin Only)

### Access User Management
1. Login as admin
2. Click "User Management" in sidebar
3. **Expected:**
   - ✅ User list loads
   - ✅ 7 users visible
   - ✅ Search and filter options present
   - ✅ "Add User" button visible

### Create New User
1. Click "Add User" button
2. Fill form:
   - Username: `testuser`
   - Email: `testuser@example.com`
   - Mobile: `1234567890`
   - Role: `team_member`
   - Password: `Test@123`
   - Confirm Password: `Test@123`
3. Click "Create User"
4. **Expected:**
   - ✅ Success message appears
   - ✅ User appears in list
   - ✅ Modal closes

### Edit User
1. Find the newly created user
2. Click edit icon
3. Change username to `testuser_updated`
4. Click "Update User"
5. **Expected:**
   - ✅ Success message appears
   - ✅ Username updated in list

### Delete User
1. Find the test user
2. Click delete icon
3. Confirm deletion
4. **Expected:**
   - ✅ Confirmation dialog appears
   - ✅ User removed from list
   - ✅ Success message appears

### Test User Filters
1. Use search box to search for "admin"
2. **Expected:** Only admin user visible
3. Select role filter "HR"
4. **Expected:** Only HR users visible
5. Clear filters
6. **Expected:** All users visible again

---

## Test 7: Job Management

### View Jobs (As HR/Admin)
1. Login as HR or Admin
2. Click "Jobs" in sidebar
3. **Expected:**
   - ✅ Job list loads
   - ✅ 3 sample jobs visible
   - ✅ "Post New Job" button visible
   - ✅ Search and filter options present

### Create New Job
1. Click "Post New Job"
2. Fill form:
   - Title: `Test Engineer`
   - Description: `Testing position for verification`
   - Department: `Engineering`
   - Location: `Mumbai, India`
   - Job Type: `Full Time`
   - Experience Level: `Mid`
   - Salary Range: `₹10,00,000 - ₹15,00,000`
   - Add requirements (at least 2)
   - Add responsibilities (at least 2)
   - Add skills (at least 3)
   - Add benefits (at least 2)
3. Click "Create Job"
4. **Expected:**
   - ✅ Success message appears
   - ✅ Redirects to job list
   - ✅ New job appears in list

### View Job Details
1. Click on the newly created job
2. **Expected:**
   - ✅ Job details page loads
   - ✅ All information displayed correctly
   - ✅ "Edit" and "Close" buttons visible (for HR/Admin)

### Edit Job
1. Click "Edit" button
2. Change title to `Test Engineer - Updated`
3. Click "Update Job"
4. **Expected:**
   - ✅ Success message appears
   - ✅ Redirects to job details
   - ✅ Title updated

### Close Job
1. Click "Close" button
2. Confirm action
3. **Expected:**
   - ✅ Job status changes to "Closed"
   - ✅ No longer visible to candidates

### View Jobs (As Candidate)
1. Logout and login as candidate
2. Click "Jobs" in sidebar
3. **Expected:**
   - ✅ Only active jobs visible
   - ✅ Closed job not visible
   - ✅ "Apply" buttons visible
   - ✅ No edit/delete options

---

## Test 8: Application Submission

### Submit Application (As Candidate)
1. Login as candidate
2. Go to Jobs list
3. Click on "Software Engineer" job
4. Click "Apply" button
5. Fill application form:
   - Name: `Test Candidate`
   - Email: `testcandidate@example.com`
   - Mobile: `9876543210`
   - Upload resume (PDF file)
6. Click "Submit Application"
7. **Expected:**
   - ✅ Success message appears
   - ✅ Redirects to applications list or dashboard
   - ✅ Application visible in "My Applications"

### View Application Status
1. Go to "My Applications" (if available) or Dashboard
2. **Expected:**
   - ✅ Application listed
   - ✅ Status shows "Pending"
   - ✅ Current stage shows "Stage 1"
   - ✅ Can view application details

---

## Test 9: Interview Assignment (HR)

### View Applications (As HR)
1. Login as HR
2. Click "Applications" in sidebar
3. **Expected:**
   - ✅ All applications visible
   - ✅ Can see candidate names
   - ✅ Can see current stages
   - ✅ Can click to view details

### Assign Team Member to Stage
1. Click on an application
2. Look for "Assign Team Member" or similar option
3. Select Stage 1 (HR Screening)
4. Select a team member from dropdown
5. Add notes (optional)
6. Click "Assign"
7. **Expected:**
   - ✅ Success message appears
   - ✅ Assignment visible in application details
   - ✅ Stage status updates to "Assigned"

---

## Test 10: Interview Feedback (Team Member)

### View Assignments (As Team Member)
1. Login as team member
2. Click "My Assignments" in sidebar
3. **Expected:**
   - ✅ Assigned applications visible
   - ✅ Can see stage numbers
   - ✅ Can see candidate names
   - ✅ Can click to submit feedback

### Submit Stage Feedback
1. Click on an assigned application
2. Click "Submit Feedback" or similar
3. Fill feedback form (varies by stage):
   - For Stage 1 (HR Screening):
     - Panel name
     - Panel feedback
     - MCQ test score
     - Communication skills rating
     - Scale (1-10)
     - Reason for scale
     - Outcome (Yes/No)
4. Click "Submit Feedback"
5. **Expected:**
   - ✅ Success message appears
   - ✅ Feedback saved
   - ✅ Stage status updates to "Completed"
   - ✅ Option to forward to HR appears

### Forward Stage to HR
1. After submitting feedback
2. Click "Forward to HR" button
3. Confirm action
4. **Expected:**
   - ✅ Success message appears
   - ✅ Stage status updates to "Forwarded"
   - ✅ HR can now review

---

## Test 11: Stage Approval (HR)

### Review Forwarded Stage (As HR)
1. Login as HR
2. Go to Applications
3. Click on application with forwarded stage
4. **Expected:**
   - ✅ Can see submitted feedback
   - ✅ "Approve" and "Reject" buttons visible
   - ✅ Can see team member's feedback

### Approve Stage
1. Click "Approve" button
2. Confirm action
3. **Expected:**
   - ✅ Success message appears
   - ✅ Application moves to next stage
   - ✅ Current stage increments
   - ✅ Next stage becomes active

### Reject Stage (Optional Test)
1. For another application
2. Click "Reject" button
3. Enter rejection reason
4. Confirm action
5. **Expected:**
   - ✅ Success message appears
   - ✅ Application status updates to "Rejected"
   - ✅ No further progression

---

## Test 12: Final Recommendation (HR)

### Complete All Stages
1. Repeat assignment, feedback, and approval for all 6 stages
2. **Expected:**
   - ✅ Each stage completes successfully
   - ✅ Application progresses through all stages
   - ✅ Current stage reaches 7

### Submit Final Recommendation
1. After Stage 6 is approved
2. Go to application details
3. Click "Final Recommendation" or similar
4. Fill final recommendation form:
   - Status: Select/Hold/Reject
   - Cumulative scale (1-10)
   - Suggestions and comments
5. Click "Submit"
6. **Expected:**
   - ✅ Success message appears
   - ✅ Application status updates to "Completed"
   - ✅ Final recommendation visible
   - ✅ No further actions available

---

## Test 13: Blind Feedback System

### Verify Blind Feedback (Team Member)
1. Login as team member who submitted feedback
2. View application details
3. **Expected:**
   - ✅ Can see own feedback
   - ✅ Cannot see other team members' feedback
   - ✅ Can see stage status

### Verify Full Feedback (HR/Admin)
1. Login as HR or Admin
2. View same application
3. **Expected:**
   - ✅ Can see all feedback from all stages
   - ✅ Can see who submitted each feedback
   - ✅ Can see all ratings and comments

---

## Test 14: File Upload

### Test Resume Upload
1. Login as candidate
2. Start new application
3. Try to upload different file types:
   - ✅ PDF file - Should work
   - ✅ DOC file - Should work
   - ✅ DOCX file - Should work
   - ❌ JPG file - Should be rejected
   - ❌ TXT file - Should be rejected

### Test File Size Limit
1. Try to upload file larger than 50MB
2. **Expected:**
   - ✅ Error message appears
   - ✅ Upload rejected
   - ✅ Helpful error message

### Verify File Storage
```bash
# Check uploads directory
docker exec ats_backend ls -la /app/uploads
```
**Expected:** Uploaded resume files visible

---

## Test 15: Role-Based Access Control

### Test Unauthorized Access
1. Login as candidate
2. Try to access admin routes:
   - http://localhost:3000/app/users
3. **Expected:**
   - ✅ Redirected to dashboard
   - ✅ Access denied

### Test API Authorization
```bash
# Try to access protected endpoint without token
curl http://localhost:8000/api/users
```
**Expected:** 401 Unauthorized error

```bash
# Try to access with invalid token
curl -H "Authorization: Bearer invalid_token" http://localhost:8000/api/users
```
**Expected:** 401 Unauthorized error

---

## Test 16: Search and Filtering

### Test Job Search
1. Go to Jobs list
2. Enter search term in search box
3. **Expected:**
   - ✅ Results filter in real-time
   - ✅ Only matching jobs visible
   - ✅ Clear search shows all jobs

### Test Job Filters
1. Select department filter
2. **Expected:** Only jobs from that department visible
3. Select status filter (HR/Admin only)
4. **Expected:** Only jobs with that status visible

### Test Application Filters
1. Go to Applications list
2. Use search to find specific candidate
3. **Expected:** Results filter correctly
4. Use status filter
5. **Expected:** Only applications with that status visible

---

## Test 17: Responsive Design

### Test Mobile View
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone, Android)
4. Navigate through all pages
5. **Expected:**
   - ✅ Layout adapts to mobile screen
   - ✅ Navigation becomes hamburger menu
   - ✅ Forms are usable
   - ✅ Buttons are tappable
   - ✅ Text is readable

### Test Tablet View
1. Select tablet device (iPad)
2. Navigate through pages
3. **Expected:**
   - ✅ Layout adapts appropriately
   - ✅ All features accessible
   - ✅ Good use of screen space

---

## Test 18: Error Handling

### Test Network Errors
1. Stop backend: `docker-compose stop backend`
2. Try to login or load data
3. **Expected:**
   - ✅ Error message appears
   - ✅ User-friendly error text
   - ✅ No application crash
4. Restart backend: `docker-compose start backend`

### Test Validation Errors
1. Try to submit form with missing fields
2. **Expected:**
   - ✅ Validation errors appear
   - ✅ Fields highlighted
   - ✅ Helpful error messages

### Test Duplicate Data
1. Try to create user with existing email
2. **Expected:**
   - ✅ Error message: "Email already registered"
   - ✅ Form not submitted
   - ✅ User can correct and retry

---

## Test 19: Performance

### Test Page Load Times
1. Open browser DevTools → Network tab
2. Navigate to different pages
3. **Expected:**
   - ✅ Pages load in < 2 seconds
   - ✅ No excessive API calls
   - ✅ Images load properly

### Test Large Data Sets
1. Create multiple jobs (10+)
2. Create multiple applications (10+)
3. Navigate to lists
4. **Expected:**
   - ✅ Lists load without lag
   - ✅ Pagination works (if implemented)
   - ✅ Filtering is responsive

---

## Test 20: Data Persistence

### Test Data Persistence
1. Create a new job
2. Restart all containers:
   ```bash
   docker-compose restart
   ```
3. Wait for services to start
4. Login and check jobs list
5. **Expected:**
   - ✅ Created job still exists
   - ✅ All data intact
   - ✅ No data loss

### Test Volume Persistence
1. Stop all containers:
   ```bash
   docker-compose down
   ```
2. Start again:
   ```bash
   docker-compose up -d
   ```
3. Login and verify data
4. **Expected:**
   - ✅ All users still exist
   - ✅ All jobs still exist
   - ✅ All applications still exist

---

## Test Results Summary

### ✅ All Tests Passed
If all tests above pass, your system is fully functional and ready for production!

### ❌ Some Tests Failed
If any tests fail:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check database connection
4. Review error messages
5. Refer to troubleshooting guide

---

## Automated Testing (Optional)

### Backend API Tests
```bash
# Install pytest
cd backend
pip install pytest pytest-asyncio httpx

# Run tests (if test files exist)
pytest
```

### Frontend Tests
```bash
# Run React tests
cd frontend
npm test
```

---

## Performance Benchmarks

### Expected Performance
- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **File Upload**: < 5 seconds (for 5MB file)
- **Database Query**: < 100ms
- **Authentication**: < 300ms

### Load Testing (Optional)
```bash
# Install Apache Bench
# Test API endpoint
ab -n 100 -c 10 http://localhost:8000/health

# Expected: 100% success rate
```

---

## Security Testing

### Test SQL Injection (Should Fail)
```bash
# Try SQL injection in login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com OR 1=1","password":"anything"}'
```
**Expected:** Login fails, no SQL injection

### Test XSS (Should Be Sanitized)
1. Try to enter `<script>alert('XSS')</script>` in form fields
2. **Expected:**
   - ✅ Script not executed
   - ✅ Text displayed as plain text
   - ✅ No XSS vulnerability

---

## Final Verification Checklist

### System Health
- [ ] All Docker containers running
- [ ] All services healthy
- [ ] No error logs
- [ ] Database connected

### Authentication
- [ ] Can register new user
- [ ] Can login with all roles
- [ ] Can logout
- [ ] Token validation works
- [ ] Unauthorized access blocked

### User Management
- [ ] Can create users (Admin)
- [ ] Can edit users (Admin)
- [ ] Can delete users (Admin)
- [ ] Can filter users
- [ ] Role permissions work

### Job Management
- [ ] Can create jobs
- [ ] Can edit jobs
- [ ] Can delete jobs
- [ ] Can close jobs
- [ ] Can filter jobs
- [ ] Candidates see only active jobs

### Application Flow
- [ ] Can submit application
- [ ] Can upload resume
- [ ] Can view application status
- [ ] Can track progress

### Interview Process
- [ ] Can assign team members
- [ ] Can submit feedback
- [ ] Can forward to HR
- [ ] Can approve/reject stages
- [ ] Can progress through all 7 stages
- [ ] Can submit final recommendation
- [ ] Blind feedback works

### UI/UX
- [ ] Responsive design works
- [ ] Loading states display
- [ ] Error messages show
- [ ] Success notifications appear
- [ ] Forms validate properly
- [ ] Navigation works

### Performance
- [ ] Pages load quickly
- [ ] No lag or freezing
- [ ] File uploads work
- [ ] Large lists handle well

### Security
- [ ] Authentication required
- [ ] Role-based access works
- [ ] File upload restrictions work
- [ ] No XSS vulnerabilities
- [ ] No SQL injection possible

### Data Persistence
- [ ] Data survives restart
- [ ] Volumes persist data
- [ ] No data loss

---

## 🎉 Congratulations!

If all tests pass, your Infopercept ATS is **FULLY FUNCTIONAL** and ready for production deployment!

---

**Test Completed:** [Date]  
**Tested By:** [Name]  
**Result:** ✅ PASS / ❌ FAIL  
**Notes:** [Any observations]

---

**Next Steps:**
1. Review any failed tests
2. Fix identified issues
3. Re-run failed tests
4. Proceed to production deployment
5. Set up monitoring and alerts

**Happy Testing! 🧪**
