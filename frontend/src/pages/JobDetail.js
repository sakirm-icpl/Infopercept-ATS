import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import ApplyOnBehalfModal from '../components/ApplyOnBehalfModal';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyOnBehalfModal, setShowApplyOnBehalfModal] = useState(false);

  const isCandidate = user?.role === 'candidate';
  const isHR = user?.role === 'hr';
  const isAdmin = user?.role === 'admin';
  const isHRorAdmin = isHR || isAdmin;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        setError('Failed to load job details');
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleDeleteJob = async () => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      try {
        await jobService.deleteJob(jobId);
        navigate('/app/jobs');
      } catch (error) {
        setError('Failed to delete job');
      }
    }
  };

  const handleCloseJob = async () => {
    if (window.confirm('Are you sure you want to close this job posting? It will no longer be visible to candidates.')) {
      try {
        await jobService.closeJob(jobId);
        setJob({ ...job, status: 'closed' });
      } catch (error) {
        setError('Failed to close job');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      closed: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="mr-1 h-4 w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getJobTypeLabel = (jobType) => {
    return jobType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getExperienceLabel = (experience) => {
    const labels = {
      entry: 'Entry Level',
      junior: 'Junior',
      mid: 'Mid Level',
      senior: 'Senior',
      lead: 'Lead',
      manager: 'Manager'
    };
    return labels[experience] || experience;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-2">{job.department}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isCandidate && getStatusBadge(job.status)}
          </div>
        </div>
      </div>

      {/* Job Actions */}
      {isHR ? (
        /* HR can only view and apply on behalf */
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {job.status === 'active' && (
              <button
                onClick={() => setShowApplyOnBehalfModal(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 inline-flex items-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Apply on Behalf
              </button>
            )}
          </div>
        </div>
      ) : isAdmin ? (
        /* Admin has full control */
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {job.status === 'active' && (
              <button
                onClick={() => setShowApplyOnBehalfModal(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 inline-flex items-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Apply on Behalf
              </button>
            )}
            
            <Link
              to={`/app/jobs/${jobId}/edit`}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 inline-flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Job
            </Link>
            
            {job.status === 'active' && (
              <button
                onClick={handleCloseJob}
                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-4 py-2 rounded-xl font-semibold transition-all duration-200 inline-flex items-center"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Close Job
              </button>
            )}
            
            <button
              onClick={handleDeleteJob}
              className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-xl font-semibold transition-all duration-200 inline-flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Job
            </button>
          </div>
        </div>
      ) : isCandidate && job.status === 'active' ? (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <Link
            to={`/app/application/${jobId}`}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 inline-flex items-center"
          >
            <FileText className="mr-2 h-5 w-5" />
            Apply for this Position
          </Link>
        </div>
      ) : isCandidate && job.status !== 'active' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 font-medium">This position is no longer accepting applications</p>
          </div>
        </div>
      ) : null}

      {/* Job Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{job.location}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{job.department}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Job Type</p>
              <p className="font-medium">{getJobTypeLabel(job.job_type)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Experience Level</p>
              <p className="font-medium">{getExperienceLabel(job.experience_level)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Posted Date</p>
              <p className="font-medium">{new Date(job.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          {job.salary_range && (
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Salary Range</p>
                <p className="font-medium">{job.salary_range}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
          <ul className="space-y-2">
            {job.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
          <ul className="space-y-2">
            {job.responsibilities.map((responsibility, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{responsibility}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
          <ul className="space-y-2">
            {job.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Application Stats - Only for HR/Admin */}
      {isHRorAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{job.applications_count || 0}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{job.active_applications || 0}</p>
              <p className="text-sm text-gray-600">Active Applications</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{job.interviews_scheduled || 0}</p>
              <p className="text-sm text-gray-600">Interviews Scheduled</p>
            </div>
          </div>
        </div>
      )}

      {/* Apply on Behalf Modal */}
      <ApplyOnBehalfModal
        isOpen={showApplyOnBehalfModal}
        onClose={() => setShowApplyOnBehalfModal(false)}
        jobId={jobId}
        jobTitle={job.title}
      />
    </div>
  );
};

export default JobDetail; 