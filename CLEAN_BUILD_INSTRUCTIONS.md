# 🔄 CLEAN BUILD FROM SCRATCH

## Step-by-Step Instructions

### Step 1: Stop Everything
```bash
docker-compose down
```

### Step 2: Remove All Containers and Volumes
```bash
docker-compose down -v
```

### Step 3: Clean Docker System (Optional but Recommended)
```bash
# Remove all unused containers, networks, images
docker system prune -a

# When prompted, type: y
```

### Step 4: Rebuild Everything from Scratch
```bash
docker-compose build --no-cache
```

### Step 5: Start All Services
```bash
docker-compose up -d
```

### Step 6: Wait for Services to be Healthy
```bash
# Wait 60-90 seconds for all services to start
# Then check status:
docker-compose ps
```

### Step 7: Watch Logs
```bash
# Watch all logs
docker-compose logs -f

# Or watch specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Step 8: Clear Browser Cache
```bash
# Close browser completely
# Reopen browser
# Or use incognito mode:
# Chrome: Ctrl + Shift + N
# Firefox: Ctrl + Shift + P
```

### Step 9: Test Application
```bash
# Visit: http://localhost:3000
# Login: admin@infopercept.com / Welcome@ATS
# Expected: ONE sidebar, ONE content area
```

---

## 🚀 Quick One-Liner (All Steps Combined)

```bash
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d && docker-compose logs -f
```

Press `Ctrl+C` to stop watching logs after services are healthy.

---

## ✅ Verification Checklist

After clean build:

- [ ] All containers running: `docker-compose ps`
- [ ] All services healthy (green status)
- [ ] Frontend accessible: http://localhost:3000
- [ ] Backend API accessible: http://localhost:8000/docs
- [ ] Can login successfully
- [ ] Dashboard loads with content
- [ ] ONE sidebar visible (not two)
- [ ] No duplicate elements
- [ ] No console errors (F12)

---

## 🐛 If Issues Occur

### Issue: Containers won't stop
```bash
docker-compose kill
docker-compose rm -f
```

### Issue: Port already in use
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000
# Kill the process using the port

# Or change ports in docker-compose.yml
```

### Issue: Build fails
```bash
# Check Docker is running
docker --version

# Check disk space
docker system df

# Clean up space if needed
docker system prune -a
```

### Issue: Services not healthy
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Restart specific service
docker-compose restart [service-name]
```

---

## 📊 Expected Timeline

- **Step 1-2:** 10 seconds
- **Step 3:** 30 seconds (if running)
- **Step 4:** 2-3 minutes (building images)
- **Step 5:** 5 seconds
- **Step 6:** 60-90 seconds (services starting)
- **Total:** ~4-5 minutes

---

## 🎯 Success Indicators

You'll know it worked when:

✅ `docker-compose ps` shows all services "Up (healthy)"
✅ http://localhost:3000 loads the home page
✅ Login redirects to dashboard
✅ Dashboard shows ONE sidebar and content
✅ No duplicate elements anywhere
✅ Console (F12) shows no errors
✅ All navigation works

---

## 💡 Pro Tips

1. **Use incognito mode** for first test (bypasses cache)
2. **Wait for "healthy" status** before testing
3. **Check logs** if something doesn't work
4. **Be patient** - first build takes 3-5 minutes
5. **Close browser** completely before testing

---

**Ready? Run the commands above!** 🚀
