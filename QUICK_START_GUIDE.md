# Quick Start Guide - Infopercept ATS

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 8000, 8081 available

### Step 1: Start the Application
```bash
# Navigate to project directory
cd Infopercept-ATS

# Start all services
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### Step 2: Wait for Services to Start
The application will take 30-60 seconds to fully start. You can check the status:
```bash
docker-compose ps
```

All services should show "healthy" status.

### Step 3: Access the Application

**Frontend (Main Application)**
- URL: http://localhost:3000
- This is where users interact with the system

**Backend API Documentation**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Database Management (Optional)**
- Mongo Express: http://localhost:8081
- Username: admin
- Password: admin

### Step 4: Login with Default Accounts

#### Admin Account
- Email: `admin@infopercept.com`
- Password: `Welcome@ATS`
- Access: Full system control

#### HR Manager Account
- Email: `hr@infopercept.com`
- Password: `Welcome@ATS`
- Access: Job management, application review

#### Team Member Account
- Email: `techlead@infopercept.com`
- Password: `Welcome@ATS`
- Access: Conduct interviews, submit feedback

#### Candidate Account
- Email: `candidate1@example.com`
- Password: `Welcome@ATS`
- Access: Browse jobs, apply, track applications

## 📋 Quick Workflow Test

### As Admin (Setup)
1. Login at http://localhost:3000/login
2. Go to "User Management" → Create HR and Team Member users
3. Go to "Jobs" → Create a new job posting

### As Candidate (Apply)
1. Logout and login as candidate
2. Browse available jobs
3. Click "Apply" on a job
4. Fill application form and upload resume
5. Submit application

### As HR (Review & Assign)
1. Logout and login as HR
2. Go to "Applications"
3. Click on the application
4. Assign team members to interview stages
5. Review application details

### As Team Member (Interview)
1. Logout and login as team member
2. Go to "My Assignments"
3. Click on assigned interview
4. Fill feedback form
5. Submit and forward to HR

### As HR (Approve & Progress)
1. Login as HR
2. Review submitted feedback
3. Approve stage
4. Application moves to next stage
5. Repeat for all stages
6. Submit final recommendation

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Application
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Troubleshooting

### Issue: Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Stop the process or change port in docker-compose.yml
```

### Issue: Services Not Starting
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Cannot Login
- Verify you're using correct credentials
- Check backend logs: `docker-compose logs backend`
- Verify MongoDB is running: `docker-compose ps mongodb`

### Issue: File Upload Fails
- Check backend logs for errors
- Verify file size (max 50MB)
- Ensure file type is PDF, DOC, or DOCX

## 📱 Mobile Access

The application is responsive and works on mobile devices:
- Access from mobile browser: `http://[your-ip]:3000`
- Replace `[your-ip]` with your computer's IP address

## 🔐 Security Notes

### For Development
- Default passwords are provided for testing
- All data is stored locally in Docker volumes

### For Production
- Change all default passwords
- Update JWT secret in `.env` files
- Use HTTPS/SSL
- Configure proper firewall rules
- Set up regular backups

## 📊 Sample Data

The system comes with:
- 7 default users (1 admin, 1 HR, 3 team members, 1 requester, 1 candidate)
- 3 sample job postings
- All interview stages configured

## 🎯 Next Steps

1. **Customize Branding**
   - Update logo in `frontend/src/components/InfoperceptLogo.js`
   - Modify colors in `frontend/src/index.css`

2. **Add More Users**
   - Login as admin
   - Go to User Management
   - Create additional users

3. **Configure Email Notifications**
   - Set up SMTP settings (future enhancement)
   - Configure notification templates

4. **Set Up Backups**
   - Configure MongoDB backup schedule
   - Set up file backup for uploads

5. **Monitor Performance**
   - Check logs regularly
   - Monitor disk space
   - Track application metrics

## 📚 Additional Resources

- **Full Documentation**: See `PROJECT_FIXES_COMPLETED.md`
- **API Documentation**: http://localhost:8000/docs
- **Setup Guide**: See `SETUP.md`
- **Docker Guide**: See `DOCKER_SETUP.md`

## 💡 Tips

1. **Use Chrome/Firefox** for best experience
2. **Clear browser cache** if you see old content
3. **Check logs** if something doesn't work
4. **Test with different roles** to understand workflow
5. **Backup data** before making changes

## 🆘 Getting Help

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Review the troubleshooting section above
4. Check `PROJECT_FIXES_COMPLETED.md` for detailed information

## ✅ Success Checklist

- [ ] All Docker containers running
- [ ] Can access frontend at http://localhost:3000
- [ ] Can login as admin
- [ ] Can see sample jobs
- [ ] Can create new user
- [ ] Can create new job
- [ ] Can apply as candidate
- [ ] Can assign interview stages
- [ ] Can submit feedback
- [ ] Can complete full workflow

---

**Congratulations!** 🎉 Your Infopercept ATS is now running!

Start by logging in as admin and exploring the system.
