# Deployment Instructions for Server 172.17.11.30

## Server Information
- **IP Address:** 172.17.11.30
- **Environment:** Production
- **Application:** Infopercept ATS

## Pre-Deployment Checklist

- [ ] Server has Docker and Docker Compose installed
- [ ] Ports 3000, 8000, and 8081 are available
- [ ] Firewall rules allow access to these ports
- [ ] Sufficient disk space (minimum 20GB free)
- [ ] Minimum 4GB RAM available

## Deployment Steps

### 1. Transfer Files to Server

```bash
# From your local machine, copy files to server
scp -r Infopercept-ATS/ user@172.17.11.30:/opt/

# Or use rsync for better performance
rsync -avz --progress Infopercept-ATS/ user@172.17.11.30:/opt/Infopercept-ATS/
```

### 2. SSH into Server

```bash
ssh user@172.17.11.30
cd /opt/Infopercept-ATS
```

### 3. Verify Environment Files

```bash
# Check that .env files exist
ls -la .env
ls -la backend/.env
ls -la frontend/.env

# Verify the configuration
cat .env | grep "172.17.11.30"
```

### 4. Set Permissions

```bash
# Make scripts executable
chmod +x *.sh

# Set proper ownership
sudo chown -R $USER:$USER /opt/Infopercept-ATS
```

### 5. Deploy the Application

```bash
# Pull latest images (if using pre-built images)
docker-compose pull

# Build and start services
docker-compose up -d --build

# Monitor the startup
docker-compose logs -f
```

### 6. Verify Deployment

```bash
# Check all services are running
docker-compose ps

# Test backend health
curl http://172.17.11.30:8000/health

# Test frontend
curl http://172.17.11.30:3000

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## Access URLs

After successful deployment, access the application at:

- **Frontend Application:** http://172.17.11.30:3000
- **Backend API:** http://172.17.11.30:8000
- **API Documentation:** http://172.17.11.30:8000/docs
- **MongoDB Express:** http://172.17.11.30:8081
  - Username: admin
  - Password: InfoperceptMongo@2024

## Default Admin Login

**Email:** admin@infopercept.com  
**Password:** Welcome@ATS

⚠️ **CRITICAL:** Change this password immediately after first login!

## Post-Deployment Tasks

### 1. Change Admin Password
- Login at http://172.17.11.30:3000
- Go to Profile Settings
- Change password to a strong, unique password

### 2. Change MongoDB Express Password
```bash
# Edit .env file
nano .env

# Change MONGO_EXPRESS_PASSWORD
# Restart services
docker-compose restart mongo-express
```

### 3. Configure Firewall

```bash
# Allow HTTP traffic
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp

# Optional: Allow MongoDB Express (remove after initial setup)
sudo ufw allow 8081/tcp

# Enable firewall
sudo ufw enable
```

### 4. Setup SSL (Recommended)

```bash
# Install Nginx
sudo apt install nginx

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/ats

# Enable site
sudo ln -s /etc/nginx/sites-available/ats /etc/nginx/sites-enabled/

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com
```

### 5. Setup Automated Backups

```bash
# Make backup script executable
chmod +x backup.sh

# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * cd /opt/Infopercept-ATS && ./backup.sh
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Check Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop
df -h
free -h
```

### Health Checks

```bash
# Backend health
curl http://172.17.11.30:8000/health

# Check database connection
docker-compose exec backend python -c "from app.database import connect_to_mongo; import asyncio; asyncio.run(connect_to_mongo())"
```

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose down
docker-compose up -d --build
```

### Cannot Access Application

```bash
# Check if services are running
docker-compose ps

# Check firewall
sudo ufw status

# Check if ports are listening
sudo netstat -tulpn | grep -E '3000|8000|8081'
```

### Database Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Verify MongoDB is accessible
docker-compose exec mongodb mongosh -u admin -p InfoperceptATS@2024!Secure --authenticationDatabase admin
```

### Frontend Cannot Connect to Backend

```bash
# Check backend is running
curl http://172.17.11.30:8000/health

# Check CORS settings in backend/.env
cat backend/.env | grep ALLOWED_ORIGINS

# Restart backend
docker-compose restart backend
```

## Maintenance Commands

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup Database

```bash
# Run backup script
./backup.sh

# Manual backup
docker-compose exec mongodb mongodump --db ats_production --archive=/backup/ats_backup_$(date +%Y%m%d).archive
```

### Restore Database

```bash
# Stop services
docker-compose down

# Restore from backup
docker-compose up -d mongodb
docker-compose exec mongodb mongorestore --db ats_production --archive=/backup/ats_backup_YYYYMMDD.archive

# Start all services
docker-compose up -d
```

### Clean Up

```bash
# Remove old containers and images
docker system prune -a

# Remove old logs
find logs/ -name "*.log" -mtime +30 -delete
```

## Security Recommendations

1. **Change all default passwords immediately**
2. **Enable firewall and restrict access**
3. **Setup SSL/TLS certificates**
4. **Regular security updates**
5. **Monitor logs for suspicious activity**
6. **Regular backups**
7. **Disable MongoDB Express in production** (after initial setup)
8. **Use strong JWT secret keys**
9. **Enable rate limiting**
10. **Regular security audits**

## Support Contacts

- **Technical Support:** support@infopercept.com
- **Emergency Contact:** [Add emergency contact]
- **Documentation:** See README.md and other documentation files

## Important Files

- `.env` - Main environment configuration
- `backend/.env` - Backend-specific configuration
- `frontend/.env` - Frontend-specific configuration
- `docker-compose.yml` - Docker orchestration
- `mongo-init.js` - Database initialization
- `backup.sh` - Backup script
- `cleanup.sh` - Cleanup script

## Notes

- All passwords in this document should be changed after deployment
- Keep this file secure and do not commit to version control
- Document any changes made to the configuration
- Maintain a change log for production deployments
