import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import { Upload, X, FileText, Briefcase, MapPin, Users, ArrowLeft } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import "react-datepicker/dist/react-datepicker.css";

const ApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [job, setJob] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    date_of_application: new Date(),
  });
  
  const [resumeFile, setResumeFile] = useState(null);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        setError('Failed to load job details');
        console.error('Error fetching job:', error);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Check if user already has an application for this job
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const applications = await applicationService.getApplications();
        const existingApplication = applications.find(app => app.job_id === jobId);
        if (existingApplication) {
          setError('You already have an application submitted for this job position.');
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      }
    };

    if (jobId) {
      checkExistingApplication();
    }
  }, [jobId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setResumeFile(acceptedFiles[0]);
      setError('');
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date_of_application: date,
    });
  };

  const removeResume = () => {
    setResumeFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('job_id', jobId);
      formDataToSend.append('date_of_application', formData.date_of_application.toISOString());
      
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }

      await applicationService.createApplication(formDataToSend);
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Apply for Position</h1>
        <p className="text-gray-600 mt-2">Submit your application for the selected position.</p>
      </div>

      {/* Job Details Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Job Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Position</p>
              <p className="font-medium">{job.title}</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{job.location}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{job.department}</p>
            </div>
          </div>
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Job Type</p>
              <p className="font-medium">{job.job_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">Application submitted successfully! Redirecting to dashboard...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div>
            <label className="form-label">Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="input"
              placeholder="Enter your mobile number"
              required
            />
          </div>

          <div>
            <label className="form-label">Date of Application *</label>
            <DatePicker
              selected={formData.date_of_application}
              onChange={handleDateChange}
              className="input"
              dateFormat="MM/dd/yyyy"
              maxDate={new Date()}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="form-label">Resume/CV *</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the resume here...'
                : 'Drag & drop a resume file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>

          {resumeFile && (
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{resumeFile.name}</span>
              </div>
              <button
                type="button"
                onClick={removeResume}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !resumeFile}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm; 