# ATS System Setup Guide

This guide will help you set up and run the Applicant Tracking System (ATS) with both backend and frontend components.

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd HR_Management

# Create virtual environment for Python backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Update the following values:
# - MONGODB_URL: Your MongoDB connection string
# - JWT_SECRET: A secure random string for JWT tokens
```

Example `.env` file:
```env
MONGODB_URL=mongodb://localhost:27017/ats_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
HOST=0.0.0.0
PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install Node.js dependencies
npm install
```

### 4. Start the Application

#### Start Backend (Terminal 1)
```bash
# From the backend directory
cd backend

# Activate virtual environment (if not already activated)
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Start the FastAPI server
python start.py
# OR
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- ReDoc Documentation: http://localhost:8000/redoc

#### Start Frontend (Terminal 2)
```bash
# From the frontend directory
cd frontend

# Start the React development server
npm start
```

The frontend will be available at: http://localhost:3000

## Database Setup

### MongoDB Local Setup

1. **Install MongoDB Community Edition**
   - Follow the [official installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB Service**
   ```bash
   # On Windows (as Administrator):
   net start MongoDB
   
   # On macOS (with Homebrew):
   brew services start mongodb-community
   
   # On Linux:
   sudo systemctl start mongod
   ```

3. **Create Database**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Create and use the database
   use ats_db
   
   # Exit
   exit
   ```

### MongoDB Atlas Setup (Cloud)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Create a new cluster (free tier is sufficient)
   - Choose your preferred cloud provider and region

3. **Configure Network Access**
   - Add your IP address to the IP Access List
   - Or add `0.0.0.0/0` for development (not recommended for production)

4. **Create Database User**
   - Create a database user with read/write permissions
   - Note down the username and password

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `ats_db`

6. **Update Environment File**
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/ats_db?retryWrites=true&w=majority
   ```

## Testing the Setup

### 1. Backend Health Check

Visit http://localhost:8000/health in your browser or use curl:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "ATS API is running"
}
```

### 2. API Documentation

Visit http://localhost:8000/docs to see the interactive API documentation.

### 3. Frontend Application

Visit http://localhost:3000 to access the ATS application.

## Creating Test Users

### Using the Registration API

1. **Create Admin User**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@example.com",
       "mobile": "1234567890",
       "password": "admin123",
       "role": "admin"
     }'
   ```

2. **Create HR User**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "hr_manager",
       "email": "hr@example.com",
       "mobile": "1234567891",
       "password": "hr123",
       "role": "hr"
     }'
   ```

3. **Create Candidate User**
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "john_doe",
       "email": "john@example.com",
       "mobile": "1234567892",
       "password": "candidate123",
       "role": "candidate"
     }'
   ```

### Using the Frontend

1. Visit http://localhost:3000/register
2. Fill out the registration form
3. Choose the appropriate role
4. Submit the form

## Default Login Credentials

After creating users, you can log in with:

- **Admin**: admin@example.com / admin123
- **HR**: hr@example.com / hr123
- **Candidate**: john@example.com / candidate123

## Features by Role

### Admin
- Full system access
- User management
- View all applications and stages
- System configuration

### HR
- Review candidate applications
- Provide feedback for all interview stages
- Move applications through the pipeline
- View application statistics

### Candidate
- Submit job application
- Upload resume
- View application status
- Track interview progress

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify network access (for Atlas)

2. **Port Already in Use**
   - Backend: Change `PORT` in `.env` file
   - Frontend: Use `npm start -- --port 3001`

3. **CORS Errors**
   - Ensure `ALLOWED_ORIGINS` in `.env` includes your frontend URL
   - Check that both backend and frontend are running

4. **File Upload Issues**
   - Ensure the `uploads` directory exists in the backend folder
   - Check file size limits in `.env`
   - Verify file type restrictions

### Logs

- **Backend logs**: Check the terminal where you started the backend
- **Frontend logs**: Check the terminal where you started the frontend
- **Browser logs**: Open Developer Tools (F12) and check the Console tab

## Production Deployment

For production deployment, consider:

1. **Environment Variables**
   - Use strong, unique JWT secrets
   - Set `DEBUG=False`
   - Use production MongoDB instance
   - Configure proper CORS origins

2. **Security**
   - Enable HTTPS
   - Use environment variables for sensitive data
   - Implement rate limiting
   - Add input validation

3. **Performance**
   - Use production-grade WSGI server (Gunicorn)
   - Configure MongoDB indexes
   - Implement caching
   - Use CDN for static files

4. **Monitoring**
   - Add logging
   - Implement health checks
   - Set up error tracking
   - Monitor database performance

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify your configuration in the `.env` file

For additional help, refer to:
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/) 