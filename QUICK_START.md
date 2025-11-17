# Quick Start Guide - Infopercept ATS

## Installation (3 Simple Steps)

### Step 1: Start the Application
```bash
docker-compose up -d
```

### Step 2: Wait for Services to Start
```bash
# Check if all services are running
docker-compose ps

# View logs to confirm startup
docker-compose logs -f
```

### Step 3: Access the Application
Open your browser and go to: **http://localhost:3000**

## First Login

**Email:** admin@infopercept.com  
**Password:** Welcome@ATS

⚠️ **IMPORTANT:** Change this password immediately after login!

## What Happens During Installation?

✅ MongoDB database is created  
✅ Required collections and indexes are set up  
✅ **ONE admin user is created**  
❌ No sample users  
❌ No sample jobs  
❌ No test data  

## Next Steps After Login

### 1. Change Your Password
- Click on your profile
- Select "Change Password"
- Set a strong, unique password

### 2. Create Users
Navigate to User Management and create:
- **HR Users** - To manage recruitment
- **Team Members** - To conduct interviews
- **Requesters** - To request new positions
- **Candidates** - For job applicants (or let them register)

### 3. Create Job Postings
- Go to "Job Management"
- Click "Create New Job"
- Fill in job details and requirements

### 4. Start Recruiting!
- Review applications
- Assign interview stages
- Track candidate progress

## Troubleshooting

### Services Not Starting?
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

### Can't Login?
- Verify you're using: admin@infopercept.com / Welcome@ATS
- Check backend logs: `docker-compose logs backend`
- Ensure MongoDB is running: `docker-compose ps mongodb`

### Need to Reset Everything?
```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Accessing Other Services

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **MongoDB Express:** http://localhost:8081
  - Username: admin
  - Password: admin

## Support

For detailed documentation, see:
- **README.md** - Complete feature documentation
- **ADMIN_CREDENTIALS.md** - Admin user details
- **INSTALLATION_CHANGES.md** - What changed in this version

## Clean Production Ready

This installation is production-ready with:
- No test data
- Single secure admin user
- Clean database
- Professional setup

You have full control over all users and data from the start!
