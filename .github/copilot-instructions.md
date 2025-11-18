# Copilot Instructions for Infopercept ATS

This document provides essential guidelines for AI coding agents to effectively contribute to the Infopercept ATS codebase.

## 1. Architecture Overview

The Infopercept ATS is a full-stack application with a clear separation between frontend and backend, orchestrated using Docker and Docker Compose.

- **Backend**: Built with FastAPI (Python), responsible for API endpoints, business logic, authentication (JWT), and database interactions.
  - **Key Directories**:
    - `backend/app/routes/`: Defines API endpoints.
    - `backend/app/services/`: Contains business logic.
    - `backend/app/models/`: Pydantic models for data validation and serialization.
    - `backend/app/auth/`: Handles authentication and authorization.
- **Frontend**: Developed using React, providing the user interface.
  - **Key Directories**:
    - `frontend/src/pages/`: Page-level components.
    - `frontend/src/components/`: Reusable UI components.
    - `frontend/src/services/`: Frontend services for API calls.
    - `frontend/src/context/`: React Context for state management (e.g., `AuthContext.js`).
- **Database**: MongoDB, initialized using `mongo-init.js`.
- **Containerization**: Docker and Docker Compose for development and deployment.
- **Reverse Proxy**: Nginx for serving the frontend and proxying requests to the backend.

## 2. Critical Developer Workflows

### 2.1. Local Development Setup (Docker Compose)
The recommended way to run the application locally is using Docker Compose.

```bash
docker-compose up -d
```
This command will start the frontend, backend, and MongoDB services.

- **Frontend Access**: `http://localhost:3000`
- **Backend API Access**: `http://localhost:8000`
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`

### 2.2. Individual Component Development

#### Backend
To run the backend independently (e.g., for faster iteration on API changes):
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
To run the frontend independently:
```bash
cd frontend
npm install
npm start
```

### 2.3. Database Initialization
The `mongo-init.js` script handles the initial setup of the MongoDB database, including default users and collections. When running with Docker Compose, this is automatically handled.

## 3. Project-Specific Conventions and Patterns

### 3.1. API Structure
- **RESTful Principles**: APIs generally follow RESTful conventions.
- **FastAPI Dependency Injection**: Utilized for authentication (`auth/dependencies.py`) and service injection.
- **Pydantic Models**: Used extensively for request and response validation and serialization.

### 3.2. Frontend State Management
- **React Context**: `frontend/src/context/AuthContext.js` is a key example for global state management related to authentication.

### 3.3. Multi-stage Interview Workflow
The application implements a 7-stage interview process. When modifying or extending this workflow, ensure changes are consistent across:
- Backend models (`backend/app/models/application.py`)
- Backend services (`backend/app/services/application_service.py`, `backend/app/services/feedback_service.py`)
- Frontend components that display or manage application stages (`frontend/src/pages/ApplicationDetail.js`, `frontend/src/components/ProgressBar.js`).

## 4. Integration Points and External Dependencies

- **Authentication**: JWT tokens are used for secure communication between frontend and backend. The `JWT_SECRET` environment variable is critical.
- **File Uploads**: Handled via `backend/app/utils/file_upload.py`.
- **Email Notifications**: Currently a future enhancement, but consider this integration point if implementing new features.

## 5. Environment Variables

Sensitive information and configuration are managed via environment variables. Refer to `env.example` and `backend/env.example` for required variables, such as `MONGO_URI`, `JWT_SECRET`, and `REACT_APP_API_URL`.

## 6. Important Files and Directories

- `docker-compose.yml`: Main Docker orchestration file.
- `backend/app/main.py`: Backend application entry point.
- `frontend/src/App.js`: Frontend application entry point.
- `mongo-init.js`: MongoDB initialization script.
- `backend/app/migrations/README.md`: Contains information about database migrations.

---
Please provide feedback on any unclear or incomplete sections to iterate and improve these instructions.