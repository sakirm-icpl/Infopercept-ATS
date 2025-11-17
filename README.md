# Infopercept ATS - Applicant Tracking System

A comprehensive Applicant Tracking System with multi-stage interview workflow, built with React, FastAPI, and MongoDB.

## 🚀 Features

### 🔐 User Roles & Access Control
- **Admin**: Full system access, user management, can create all other users
- **HR**: Job posting management, candidate assignment, interview stage management
- **Team Member**: Conduct interviews, submit feedback, view assigned candidates
- **Requester**: Initiate job requests, can be assigned to interviews
- **Candidate**: Apply to jobs, track application status

### 📋 Interview Workflow (7 Stages)
1. **Resume Screening** - Initial resume review and screening
2. **HR Telephonic Interview** - Telephonic screening with HR
3. **Practical Lab Test** - Technical coding/assessment
4. **Technical Interview** - Technical interview with detailed feedback
5. **BU Lead Round** - Business Unit Lead interview
6. **HR Head Round** - HR Head interview
7. **CEO Round** - Final CEO interview

### 🎯 Key Features
- **Role-based Access Control**: Secure access based on user roles
- **Multi-stage Interview Process**: Structured 7-stage interview workflow
- **Team Member Assignment**: HR can assign specific stages to team members
- **Blind Feedback System**: Interviewers can only see their own feedback to avoid bias
- **Comprehensive Feedback System**: Detailed feedback forms for each stage
- **Progress Tracking**: Visual progress indicators and status tracking
- **Final Recommendations**: Complete evaluation and decision system
- **Modern UI**: Clean, responsive interface with Infopercept branding

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database for flexible data storage
- **JWT Authentication**: Secure token-based authentication
- **Pydantic**: Data validation and serialization

### Frontend
- **React**: Modern JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and static file serving

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ (for local development)
- Python 3.8+ (for local development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Infopercept-ATS
```

### 2. Environment Setup
```bash
# Copy environment files
cp env.example .env
cp backend/env.example backend/.env
```

### 3. Start with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB Express**: http://localhost:8081 (optional)

### 5. Default Login Credentials

⚠️ **Only ONE admin user is created during installation:**

- **Admin**: admin@infopercept.com / Welcome@ATS

**IMPORTANT:** Change the default password immediately after first login!

All other users (HR, Team Members, Requesters, Candidates) must be created through the application interface by the admin user.

## 📋 Interview Workflow Guide

### For HR Users
1. **Create Job Postings**: Add new job positions with detailed requirements
2. **Review Applications**: View candidate applications and assign interview stages
3. **Assign Team Members**: Assign specific interview stages to team members
4. **Monitor Progress**: Track interview progress across all stages
5. **Final Decision**: Submit final recommendations after all stages

### For Team Members
1. **View Assignments**: Check assigned interview stages in "My Assignments"
2. **Conduct Interviews**: Use structured forms for each interview stage
3. **Submit Feedback**: Provide detailed feedback, ratings, and recommendations
4. **Track Progress**: Monitor application progress through stages

### For Requesters
1. **Initiate Job Requests**: Submit requests for new positions
2. **Participate in Interviews**: Can be assigned to specific interview stages
3. **Review Candidates**: Provide feedback on assigned candidates

### For Candidates
1. **Browse Jobs**: View available job postings in the "Browse Jobs" section
2. **Apply**: Submit applications with resume upload using the "Apply" button
3. **Track Status**: Monitor application progress through interview stages
4. **Job Details**: View complete job descriptions, requirements, and benefits

## 🔧 Development Setup

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Setup
```bash
# MongoDB will be automatically initialized with:
# - Default admin user
# - Required collections and indexes
# - Sample data (if provided)
```

## 📁 Project Structure

```
Infopercept-ATS/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Pydantic models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── auth/           # Authentication
│   │   └── utils/          # Utilities
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker orchestration
├── mongo-init.js          # Database initialization
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access
- **HR**: Job and application management
- **Team Member**: Interview conduction
- **Requester**: Job requests and interviews
- **Candidate**: Application submission

### JWT Tokens
- Secure token-based authentication
- Role-based access control
- Automatic token refresh

## 📊 Database Schema

### Collections
- **users**: User accounts and roles
- **jobs**: Job postings and requirements
- **applications**: Candidate applications
- **stage_assignments**: Interview stage assignments

### Key Relationships
- Applications link to Jobs and Candidates
- Stage assignments link to Applications and Team Members
- Interview feedback stored within application stages

## 🚀 Deployment

### Production Deployment
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `REACT_APP_API_URL`: Frontend API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is proprietary to Infopercept.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs`

## 🔄 Updates & Maintenance

### Regular Maintenance
- Database backups
- Security updates
- Performance monitoring
- User feedback collection

### Future Enhancements
- Email notifications
- Advanced reporting
- Integration with HR systems
- Mobile application
- Advanced analytics dashboard