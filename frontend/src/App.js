import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './components/Notification';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetail from './pages/ApplicationDetail';
import ApplicationsList from './pages/ApplicationsList';
import UserManagement from './pages/UserManagement';
import JobCreate from './pages/JobCreate';
import JobEdit from './pages/JobEdit';
import JobDetail from './pages/JobDetail';
import JobsList from './pages/JobsList';
import Layout from './components/Layout';
import MyAssignments from './pages/MyAssignments';
import MyApplications from './pages/MyApplications';
import InterviewForm from './pages/InterviewForm';
import FeedbackForm from './pages/FeedbackForm';
import FinalRecommendation from './pages/FinalRecommendation';
import DiagnosticPage from './pages/DiagnosticPage';
import FeedbackStatistics from './pages/FeedbackStatistics';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Job Routes */}
          <Route path="jobs" element={
            <ProtectedRoute allowedRoles={['hr', 'admin', 'candidate']}>
              <JobsList />
            </ProtectedRoute>
          } />
          <Route path="jobs/create" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <JobCreate />
            </ProtectedRoute>
          } />
          <Route path="jobs/:jobId/edit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <JobEdit />
            </ProtectedRoute>
          } />
          <Route path="jobs/:jobId" element={
            <ProtectedRoute allowedRoles={['hr', 'admin', 'candidate']}>
              <JobDetail />
            </ProtectedRoute>
          } />
          
          {/* Candidate Routes */}
          <Route path="application/:jobId" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ApplicationForm />
            </ProtectedRoute>
          } />
          <Route path="my-applications" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <MyApplications />
            </ProtectedRoute>
          } />
          
          {/* HR and Admin Routes */}
          <Route path="applications" element={
            <ProtectedRoute allowedRoles={['hr', 'admin', 'team_member', 'ceo']}>
              <ApplicationsList />
            </ProtectedRoute>
          } />
          <Route path="applications/:id" element={
            <ProtectedRoute allowedRoles={['hr', 'admin', 'team_member', 'candidate', 'ceo']}>
              <ApplicationDetail />
            </ProtectedRoute>
          } />
          
          {/* Team Member and HR Routes */}
          <Route path="my-assignments" element={
            <ProtectedRoute allowedRoles={['team_member', 'hr']}>
              <MyAssignments />
            </ProtectedRoute>
          } />
          <Route path="applications/:id/interview/:stage" element={
            <ProtectedRoute allowedRoles={['team_member']}>
              <InterviewForm />
            </ProtectedRoute>
          } />
          <Route path="applications/:id/feedback/:stage" element={
            <ProtectedRoute allowedRoles={['team_member', 'admin', 'hr']}>
              <FeedbackForm />
            </ProtectedRoute>
          } />
          <Route path="applications/:id/final-recommendation" element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <FinalRecommendation />
            </ProtectedRoute>
          } />
          
          {/* Admin Only Routes */}
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          {/* Feedback Statistics - Admin and HR */}
          <Route path="feedback-statistics" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'ceo']}>
              <FeedbackStatistics />
            </ProtectedRoute>
          } />
          
          {/* Diagnostic Page - Available to all authenticated users */}
          <Route path="diagnostic" element={<DiagnosticPage />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// App with Auth Provider and Notification Provider
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App; 