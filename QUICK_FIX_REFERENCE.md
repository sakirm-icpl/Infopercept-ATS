# ⚡ Quick Fix Reference Card

## 🔥 Most Common Issues & Instant Fixes

### Issue 1: Blank Pages
**Symptom:** Sidebar visible, content area blank/white  
**Fix:** `Ctrl + Shift + R` (Hard refresh browser)  
**Time:** 2 seconds

### Issue 2: Duplicate Sidebars
**Symptom:** Two sidebars side-by-side  
**Fix:** Rebuild frontend + hard refresh  
**Time:** 1 minute

```bash
docker-compose build --no-cache frontend && docker-compose up -d frontend
# Wait 30 seconds, then Ctrl+Shift+R in browser
```

### Issue 3: Can't Login
**Symptom:** Login fails or redirects to login  
**Fix:** Check backend is running  
**Time:** 30 seconds

```bash
docker-compose ps backend
# If not healthy:
docker-compose restart backend
```

### Issue 4: API Errors
**Symptom:** "Failed to fetch" in console  
**Fix:** Restart backend  
**Time:** 30 seconds

```bash
docker-compose restart backend
```

### Issue 5: Styles Not Loading
**Symptom:** No colors, plain text  
**Fix:** Rebuild frontend  
**Time:** 1 minute

```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## 🚀 One-Command Fixes

### Nuclear Option (Fixes Everything)
```bash
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```
**Time:** 2-3 minutes  
**Fixes:** All issues

### Quick Restart
```bash
docker-compose restart
```
**Time:** 30 seconds  
**Fixes:** Most runtime issues

### Frontend Only
```bash
docker-compose restart frontend
```
**Time:** 10 seconds  
**Fixes:** UI issues

### Backend Only
```bash
docker-compose restart backend
```
**Time:** 10 seconds  
**Fixes:** API issues

---

## 🔍 Quick Diagnostics

### Check All Services
```bash
docker-compose ps
```
**Expected:** All "Up (healthy)"

### Check Logs
```bash
docker-compose logs --tail=20
```
**Look for:** Red error messages

### Check Frontend
```bash
docker-compose logs frontend | tail -10
```
**Expected:** "Compiled successfully!"

### Check Backend
```bash
docker-compose logs backend | tail -10
```
**Expected:** "Application startup complete"

---

## 🌐 Quick URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| Backend API | http://localhost:8000 | API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Mongo Express | http://localhost:8081 | Database UI |
| Diagnostic | http://localhost:3000/app/diagnostic | System check |

---

## 👤 Quick Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@infopercept.com | Welcome@ATS |
| HR | hr@infopercept.com | Welcome@ATS |
| Team Member | techlead@infopercept.com | Welcome@ATS |
| Candidate | candidate1@example.com | Welcome@ATS |

---

## 🎯 Quick Tests

### Test 1: System Health (10 seconds)
```bash
curl http://localhost:8000/health
```
**Expected:** `{"status":"healthy"}`

### Test 2: Frontend Loading (5 seconds)
```bash
curl http://localhost:3000
```
**Expected:** HTML with "Infopercept"

### Test 3: Database Connection (5 seconds)
```bash
docker exec ats_mongodb mongosh --eval "db.adminCommand('ping')"
```
**Expected:** `{ ok: 1 }`

---

## 🔧 Quick Fixes by Symptom

| Symptom | Quick Fix | Command |
|---------|-----------|---------|
| Blank pages | Hard refresh | `Ctrl+Shift+R` |
| Two sidebars | Rebuild frontend | `docker-compose build --no-cache frontend` |
| Can't login | Restart backend | `docker-compose restart backend` |
| No styles | Clear cache | `Ctrl+Shift+Delete` |
| API errors | Check backend | `docker-compose logs backend` |
| Slow loading | Restart all | `docker-compose restart` |
| Port in use | Stop all | `docker-compose down` |
| Database error | Restart MongoDB | `docker-compose restart mongodb` |

---

## 📱 Browser Quick Fixes

### Chrome
- **Hard Refresh:** `Ctrl+Shift+R`
- **Clear Cache:** `Ctrl+Shift+Delete`
- **Incognito:** `Ctrl+Shift+N`
- **DevTools:** `F12`

### Firefox
- **Hard Refresh:** `Ctrl+Shift+R`
- **Clear Cache:** `Ctrl+Shift+Delete`
- **Private:** `Ctrl+Shift+P`
- **DevTools:** `F12`

### Safari
- **Hard Refresh:** `Cmd+Shift+R`
- **Clear Cache:** `Cmd+Option+E`
- **Private:** `Cmd+Shift+N`
- **DevTools:** `Cmd+Option+I`

---

## 🆘 Emergency Commands

### Everything Broken?
```bash
# Stop everything
docker-compose down -v

# Remove all
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

### Can't Stop Containers?
```bash
# Force stop
docker-compose kill

# Remove
docker-compose rm -f
```

### Port Already in Use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## ✅ Quick Verification

After any fix, verify:
1. ✅ `docker-compose ps` - All healthy
2. ✅ http://localhost:3000 - Loads
3. ✅ Login works
4. ✅ Dashboard shows content
5. ✅ One sidebar (not two)
6. ✅ No console errors (F12)

---

## 📞 Quick Support

**Before asking for help, try:**
1. Hard refresh browser (`Ctrl+Shift+R`)
2. Restart services (`docker-compose restart`)
3. Check logs (`docker-compose logs`)
4. Visit diagnostic page (http://localhost:3000/app/diagnostic)
5. Read error messages in console (F12)

**Collect this info:**
```bash
# System info
docker --version
docker-compose --version

# Service status
docker-compose ps

# Recent logs
docker-compose logs --tail=50 > logs.txt
```

---

## 🎓 Pro Tips

1. **Always hard refresh** after Docker changes
2. **Use incognito mode** for testing
3. **Check logs first** before assuming broken
4. **Wait for "healthy"** status before testing
5. **Clear cache regularly** during development
6. **Use diagnostic page** for quick checks
7. **Restart specific service** instead of all
8. **Check browser console** for errors
9. **Test in different browser** if issues persist
10. **Read error messages** - they usually tell you what's wrong

---

## 📊 Quick Status Check

```bash
# One command to check everything
docker-compose ps && \
curl -s http://localhost:8000/health && \
curl -s http://localhost:3000 | grep -q "Infopercept" && \
echo "✅ All systems operational"
```

---

## 🔄 Quick Update Workflow

```bash
# 1. Stop services
docker-compose down

# 2. Pull latest code
git pull

# 3. Rebuild
docker-compose build --no-cache

# 4. Start
docker-compose up -d

# 5. Verify
docker-compose ps

# 6. Test
# Visit http://localhost:3000
```

---

**Print this page and keep it handy!** 📄

Most issues are fixed in under 1 minute with these commands.
