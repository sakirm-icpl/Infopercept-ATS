# Installation Changes - Single Admin User Only

## Summary

The installation process has been updated to create **ONLY ONE admin user** during initial setup. All sample users, jobs, and test data have been removed.

## What Changed

### Before
During installation, the system automatically created:
- 1 Admin user
- 1 HR user
- 4 Team member users (tech lead, BU lead, CEO, department head)
- 1 Candidate user
- 3 Sample job postings

### After
During installation, the system now creates:
- **1 Admin user ONLY**
- No sample users
- No sample jobs
- No test data

## Default Admin Credentials

**Email:** admin@infopercept.com  
**Password:** Welcome@ATS  
**Role:** admin

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

## Creating Additional Users

After logging in as admin, you can create all other users through the application:

1. Log in with admin credentials
2. Navigate to User Management
3. Create users with appropriate roles:
   - **HR Users** - For managing recruitment
   - **Team Members** - For conducting interviews
   - **Requesters** - For requesting positions
   - **Candidates** - For job applicants

## Files Modified

1. **mongo-init.js** - Removed all sample user and job creation code
2. **README.md** - Updated to reflect single admin user creation
3. **ADMIN_CREDENTIALS.md** - New file documenting admin credentials
4. **INSTALLATION_CHANGES.md** - This file documenting the changes

## Benefits

✅ **Clean Production Environment** - No test data in production  
✅ **Better Security** - Only one default user to secure  
✅ **Full Control** - Admin controls all user creation  
✅ **No Cleanup Needed** - No sample data to remove  
✅ **Professional Setup** - Ready for real-world use  

## Migration Notes

If you're upgrading from a previous installation:

1. The existing users will remain in your database
2. Only new installations will have the single admin user
3. To get a clean installation, you need to:
   ```bash
   # Stop and remove all containers and volumes
   docker-compose down -v
   
   # Rebuild and start fresh
   docker-compose up -d --build
   ```

## Verification

After installation, verify that only the admin user exists:

1. Access MongoDB Express at http://localhost:8081
2. Navigate to the `users` collection
3. Confirm only one user exists: admin@infopercept.com

Or use the API:
```bash
# Login as admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infopercept.com","password":"Welcome@ATS"}'

# List users (requires admin token)
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Support

If you encounter any issues with the new installation process, please:
1. Check that you're using the latest version of the code
2. Ensure all containers are rebuilt: `docker-compose up -d --build`
3. Verify the mongo-init.js file has been updated
4. Check the MongoDB logs: `docker-compose logs mongodb`
