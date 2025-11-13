# Pages Display Issue - Fix Guide

## Issue Identified
The sidebar is rendering correctly but the main content area appears blank. This is typically caused by:

1. **CSS not loading properly**
2. **Missing Tailwind CSS build**
3. **Runtime JavaScript errors**
4. **Missing component dependencies**

## Quick Fixes

### Fix 1: Rebuild Frontend with Tailwind CSS

```bash
# Stop the frontend container
docker-compose stop frontend

# Rebuild without cache
docker-compose build --no-cache frontend

# Start again
docker-compose up -d frontend

# Check logs
docker-compose logs -f frontend
```

### Fix 2: Local Development Fix

If running locally (not Docker):

```bash
cd frontend

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf build .cache

# Start development server
npm start
```

### Fix 3: Verify Tailwind CSS is Working

Create a test file to verify Tailwind is working:

**frontend/src/pages/TestPage.js**
```javascript
import React from 'react';

const TestPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Test Page - Tailwind CSS Working
      </h1>
      <div className="bg-blue-100 p-6 rounded-lg">
        <p className="text-gray-800">
          If you can see this styled content, Tailwind CSS is working correctly.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-red-500 text-white p-4 rounded">Red Box</div>
        <div className="bg-green-500 text-white p-4 rounded">Green Box</div>
        <div className="bg-blue-500 text-white p-4 rounded">Blue Box</div>
      </div>
    </div>
  );
};

export default TestPage;
```

Add route in App.js:
```javascript
<Route path="test" element={<TestPage />} />
```

Then visit: http://localhost:3000/app/test

### Fix 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Common errors:
   - "Cannot read property of undefined" - Missing data
   - "Module not found" - Missing import
   - "Unexpected token" - Syntax error

### Fix 5: Verify API Connection

The blank page might be because the frontend can't connect to the backend.

**Check in browser console:**
```javascript
// Open console (F12) and run:
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e));
```

Expected output:
```json
{
  "status": "healthy",
  "message": "ATS API is running"
}
```

### Fix 6: Force Refresh Browser

Sometimes the browser caches old CSS/JS:

1. **Hard Refresh:**
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Clear Cache:**
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

### Fix 7: Check Docker Logs

```bash
# Check frontend logs for errors
docker-compose logs frontend | tail -50

# Check backend logs
docker-compose logs backend | tail -50

# Check all services
docker-compose logs --tail=50
```

Look for:
- ❌ Build errors
- ❌ Module not found errors
- ❌ Port binding errors
- ❌ Network errors

## Detailed Troubleshooting

### Step 1: Verify Services Are Running

```bash
docker-compose ps
```

All services should show "Up" and "healthy":
```
NAME                STATUS
ats_backend         Up (healthy)
ats_frontend        Up (healthy)
ats_mongodb         Up (healthy)
```

### Step 2: Check Frontend Build

```bash
# Enter frontend container
docker exec -it ats_frontend sh

# Check if build files exist
ls -la /usr/share/nginx/html/

# Should see:
# - index.html
# - static/ folder
# - asset-manifest.json
```

### Step 3: Check Nginx Configuration

```bash
# Check nginx config
docker exec ats_frontend cat /etc/nginx/conf.d/default.conf

# Test nginx configuration
docker exec ats_frontend nginx -t
```

### Step 4: Verify Network Connectivity

```bash
# From frontend container, ping backend
docker exec ats_frontend ping -c 3 backend

# Should get responses
```

### Step 5: Check Environment Variables

```bash
# Check frontend env
docker exec ats_frontend env | grep REACT_APP

# Should show:
# REACT_APP_API_URL=http://localhost:8000
```

## Common Issues & Solutions

### Issue 1: White Screen / Blank Page

**Cause:** CSS not loading or JavaScript error

**Solution:**
1. Check browser console for errors
2. Verify Tailwind CSS is built
3. Hard refresh browser (Ctrl+Shift+R)
4. Rebuild frontend container

### Issue 2: "Cannot GET /app/dashboard"

**Cause:** React Router not configured properly

**Solution:**
Check nginx.conf has:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue 3: API Calls Failing

**Cause:** CORS or network issue

**Solution:**
1. Check backend CORS settings
2. Verify API URL in .env
3. Check backend is running
4. Test API directly: http://localhost:8000/docs

### Issue 4: Styles Not Applied

**Cause:** Tailwind CSS not compiled

**Solution:**
```bash
cd frontend
npm run build
```

Verify `build/static/css/` contains CSS files.

### Issue 5: Components Not Rendering

**Cause:** Missing imports or props

**Solution:**
Check browser console for:
- "X is not defined"
- "Cannot read property of undefined"
- "Failed to compile"

## Verification Steps

After applying fixes, verify:

### ✅ Checklist

1. **Services Running**
   ```bash
   docker-compose ps
   # All should be "Up (healthy)"
   ```

2. **Frontend Accessible**
   - Visit: http://localhost:3000
   - Should see home page

3. **Login Works**
   - Go to: http://localhost:3000/login
   - Login with: admin@infopercept.com / Welcome@ATS
   - Should redirect to dashboard

4. **Dashboard Loads**
   - Should see: "Admin Dashboard" title
   - Should see: Statistics cards
   - Should see: Quick actions
   - Should see: Sidebar navigation

5. **Navigation Works**
   - Click "Job Management"
   - Should see jobs list
   - Click "User Management"
   - Should see users list

6. **Styles Applied**
   - Sidebar should have gradient background
   - Buttons should have colors
   - Cards should have shadows
   - Text should be readable

7. **No Console Errors**
   - Open DevTools (F12)
   - Console should be clean
   - No red error messages

## Emergency Fix: Complete Rebuild

If nothing else works, do a complete rebuild:

```bash
# Stop everything
docker-compose down -v

# Remove all images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Wait for services to be healthy (30-60 seconds)
docker-compose ps

# Check logs
docker-compose logs -f
```

## Testing Individual Pages

### Test Dashboard
```
URL: http://localhost:3000/app/dashboard
Expected: Dashboard with stats and quick actions
```

### Test Jobs List
```
URL: http://localhost:3000/app/jobs
Expected: List of 3 sample jobs
```

### Test User Management
```
URL: http://localhost:3000/app/users
Expected: List of 7 users (admin only)
```

### Test Applications
```
URL: http://localhost:3000/app/applications
Expected: List of applications (if any)
```

## Still Not Working?

### Collect Debug Information

```bash
# 1. Check Docker version
docker --version
docker-compose --version

# 2. Check system resources
docker stats --no-stream

# 3. Export logs
docker-compose logs > debug-logs.txt

# 4. Check disk space
df -h

# 5. Check port availability
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### Manual Frontend Start (Bypass Docker)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Should open browser automatically
# Or visit: http://localhost:3000
```

If this works, the issue is with Docker configuration.

### Manual Backend Start (Bypass Docker)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start server
python start.py

# Should start on http://localhost:8000
```

## Contact Support

If you've tried all fixes and still have issues:

1. **Collect Information:**
   - Docker version
   - Operating system
   - Error messages from console
   - Screenshots of the issue
   - Log files

2. **Check Documentation:**
   - README.md
   - SETUP.md
   - PROJECT_FIXES_COMPLETED.md

3. **Common Solutions:**
   - Restart computer
   - Update Docker
   - Check firewall settings
   - Disable antivirus temporarily
   - Try different browser

## Success Indicators

You'll know it's working when:

✅ Home page loads with Infopercept branding
✅ Login page has styled form
✅ Dashboard shows colored cards and stats
✅ Sidebar has gradient background
✅ Navigation links work
✅ No console errors
✅ API calls succeed
✅ Data loads properly

---

**Most Common Fix:** Hard refresh browser (Ctrl+Shift+R) after starting Docker containers!
