# Deployment Guide - Ubuntu Linux Server

This guide will help you deploy the Infopercept ATS application on an Ubuntu Linux server with a clean installation (no existing data).

## Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or later
- Minimum 2GB RAM (4GB recommended)
- 20GB free disk space
- Root or sudo access

### Required Software
- Docker
- Docker Compose
- Git

## Step 1: Prepare the Server

### 1.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Docker
```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
```

### 1.3 Install Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 1.4 Install Git
```bash
sudo apt install -y git
```

## Step 2: Clone the Repository

```bash
# Navigate to your preferred directory
cd /opt

# Clone the repository
sudo git clone <YOUR_REPOSITORY_URL> Infopercept-ATS

# Change ownership (replace 'username' with your actual username)
sudo chown -R $USER:$USER Infopercept-ATS

# Navigate to project directory
cd Infopercept-ATS
```

## Step 3: Configure Environment Variables

### 3.1 Backend Configuration
```bash
# Create backend .env file (if needed)
cat > backend/.env << 'EOF'
MONGODB_URL=mongodb://mongodb:27017/ats_db
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://localhost
MAX_FILE_SIZE=5242880
EOF
```

### 3.2 Update docker-compose.yml (if needed)
The existing docker-compose.yml should work, but you can modify ports if needed:
```bash
# Edit docker-compose.yml if you need to change ports
nano docker-compose.yml
```

## Step 4: Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future SSL setup)
sudo ufw allow 443/tcp

# Allow application ports
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend API
sudo ufw allow 8081/tcp  # Mongo Express (optional, for admin access)

# Enable firewall
sudo ufw enable
```

## Step 5: Build and Start the Application

### 5.1 Build Docker Images
```bash
# Build all services
docker-compose build

# This will take several minutes on first build
```

### 5.2 Start the Application
```bash
# Start all containers in detached mode
docker-compose up -d

# Check if all containers are running
docker-compose ps
```

Expected output:
```
NAME                IMAGE                      STATUS
ats_backend         infopercept-ats-backend    Up (healthy)
ats_frontend        infopercept-ats-frontend   Up (healthy)
ats_mongodb         mongo:7.0                  Up (healthy)
ats_mongo_express   mongo-express:1.0.0        Up
```

### 5.3 View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## Step 6: Create Initial Admin User

### 6.1 Access the Application
Open your browser and navigate to:
```
http://YOUR_SERVER_IP:3000
```

### 6.2 Register First Admin User
1. Click on "Sign Up" or "Register"
2. Fill in the registration form:
   - Username: admin
   - Email: admin@yourcompany.com
   - Password: (choose a strong password)
   - Mobile: Your phone number
   - Role: Select "Admin"
3. Click "Register"

### 6.3 Login
1. Use the credentials you just created to login
2. You now have full admin access

## Step 7: Post-Deployment Configuration

### 7.1 Create Additional Users
As admin, you can create additional users:
1. Navigate to "User Management"
2. Click "Create User"
3. Fill in user details and assign appropriate roles:
   - Admin: Full system access
   - HR: Manage applications, assignments, view jobs
   - Team Member: Interview assignments and feedback
   - Candidate: Apply for jobs, track applications

### 7.2 Create Job Postings
1. Navigate to "Job Management"
2. Click "Create Job Posting"
3. Fill in job details
4. Publish the job

## Step 8: Setup Reverse Proxy (Optional but Recommended)

### 8.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 8.2 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/ats
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or server IP

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase upload size for resumes
    client_max_body_size 10M;
}
```

### 8.3 Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ats /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 9: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure Nginx for HTTPS
```

## Step 10: Setup Auto-Start on Boot

Docker containers are already configured to restart automatically. To ensure Docker starts on boot:

```bash
sudo systemctl enable docker
```

## Step 11: Backup Strategy

### 11.1 Create Backup Script
```bash
sudo nano /usr/local/bin/backup-ats.sh
```

Add the following:
```bash
#!/bin/bash
BACKUP_DIR="/backup/ats"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec ats_mongodb mongodump --out /tmp/backup
docker cp ats_mongodb:/tmp/backup $BACKUP_DIR/mongodb_$DATE

# Backup uploaded files
docker cp ats_backend:/app/uploads $BACKUP_DIR/uploads_$DATE

# Compress backup
cd $BACKUP_DIR
tar -czf ats_backup_$DATE.tar.gz mongodb_$DATE uploads_$DATE
rm -rf mongodb_$DATE uploads_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "ats_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: ats_backup_$DATE.tar.gz"
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/backup-ats.sh
```

### 11.2 Schedule Daily Backups
```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-ats.sh >> /var/log/ats-backup.log 2>&1
```

## Maintenance Commands

### View Application Status
```bash
docker-compose ps
```

### Stop Application
```bash
docker-compose down
```

### Start Application
```bash
docker-compose up -d
```

### Restart Application
```bash
docker-compose restart
```

### View Logs
```bash
docker-compose logs -f
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Clean Up Old Data (Fresh Start)
```bash
# Stop containers
docker-compose down

# Remove volumes (THIS WILL DELETE ALL DATA!)
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs [service-name]

# Check if ports are already in use
sudo netstat -tulpn | grep -E '3000|8000|27017'
```

### Database Connection Issues
```bash
# Check MongoDB status
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/Infopercept-ATS
```

## Security Recommendations

1. **Change Default Passwords**: Update JWT secret key in backend/.env
2. **Enable Firewall**: Use ufw to restrict access
3. **Setup SSL**: Use Let's Encrypt for HTTPS
4. **Regular Updates**: Keep system and Docker images updated
5. **Backup Regularly**: Implement automated backup strategy
6. **Monitor Logs**: Regularly check application logs
7. **Restrict Mongo Express**: Only allow access from trusted IPs or disable in production

## Access Points

After deployment, you can access:

- **Frontend Application**: http://YOUR_SERVER_IP:3000
- **Backend API**: http://YOUR_SERVER_IP:8000
- **API Documentation**: http://YOUR_SERVER_IP:8000/docs
- **Mongo Express** (Admin): http://YOUR_SERVER_IP:8081

## Support

For issues or questions:
1. Check application logs: `docker-compose logs`
2. Review this deployment guide
3. Check Docker container status: `docker-compose ps`

## Summary

Your Infopercept ATS application is now deployed and running on Ubuntu Linux! The system starts with a clean database and is ready for production use.
