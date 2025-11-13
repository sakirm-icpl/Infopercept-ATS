import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import { userService } from '../services/userService';
import { ArrowLeft, FileText, User, Mail, Phone, Calendar, Users, AlertTriangle, Clock as ClockIcon, History } from 'lucide-react';
import AssignmentModal from '../components/AssignmentModal';
import BulkAssignmentModal from '../components/BulkAssignmentModal';
import FeedbackViewModal from '../components/FeedbackViewModal';
import AssignmentHistoryModal from '../components/AssignmentHistoryModal';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import FeedbackSummary from '../components/FeedbackSummary';

const ApplicationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showBulkAssignmentModal, setShowBulkAssignmentModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(1);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchApplication();
    if (user?.role === 'hr' || user?.role === 'admin') {
      console.log('User has HR or Admin role, fetching team members...');
      fetchTeamMembers();
    }
  }, [id, user]);

  const fetchApplication = async () => {
    try {
      const data = await applicationService.getApplicationById(id);
      setApplication(data);
    } catch (error) {
      setError('Failed to load application details');
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      console.log('Fetching team members for assignment...');
      const data = await userService.getTeamMembersForAssignment();
      console.log('Team members data:', data);
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleAssignmentSuccess = async () => {
    // Refresh application data after successful assignment
    await fetchApplication();
  };

  const getStageName = (stageNumber) => {
    const stages = {
      1: 'HR Screening',
      2: 'Practical Lab Test',
      3: 'Technical Interview',
      4: 'HR Round',
      5: 'BU Lead Interview',
      6: 'CEO Interview',
      7: 'Final Recommendation & Offer'
    };
    return stages[stageNumber] || `Stage ${stageNumber}`;
  };

  const getStageStatus = (stageNumber) => {
    if (!application?.stages) return 'pending';
    const statusField = `stage${stageNumber}_status`;
    return application.stages[statusField] || 'pending';
  };

  const getStageAssignee = (stageNumber) => {
    if (!application?.stages) return null;
    const assigneeField = `stage${stageNumber}_assigned_to`;
    return application.stages[assigneeField] || null;
  };

  const getStageFeedback = (stageNumber) => {
    if (!application?.stages) return null;
    const feedbackField = `stage${stageNumber}_feedback`;
    return application.stages[feedbackField] || null;
  };

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return null;
    if (assigneeId === user?.id) return 'You';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.username : `User ID: ${assigneeId}`;
  };

  const handleViewFeedback = (stageNumber) => {
    const feedback = getStageFeedback(stageNumber);
    if (feedback) {
      setSelectedFeedback({ feedback, stageNumber });
      setShowFeedbackModal(true);
    }
  };

  const getCompletedStagesCount = () => {
    if (!application?.stages) return 0;
    let count = 0;
    for (let i = 1; i <= 7; i++) {
      const status = getStageStatus(i);
      if (status === 'completed') {
        count++;
      }
    }
    return count;
  };

  const getStageDeadline = (stageNumber) => {
    if (!application?.stages) return null;
    const deadlineField = `stage${stageNumber}_deadline`;
    return application.stages[deadlineField] || null;
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline < 0) {
      return 'overdue';
    } else if (hoursUntilDeadline <= 24) {
      return 'warning';
    }
    return 'normal';
  };

  const getAvailableStagesForBulkAssignment = () => {
    if (!application?.stages) return [];
    const availableStages = [];
    for (let i = 1; i <= 7; i++) {
      const status = getStageStatus(i);
      if (status === 'pending') {
        availableStages.push(i);
      }
    }
    return availableStages;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleForwardToHR = async (stageNumber) => {
    try {
      // Check if user is a team member and has completed the stage
      const status = getStageStatus(stageNumber);
      const assignee = getStageAssignee(stageNumber);
      
      if (user?.role === 'team_member' && status === 'completed' && assignee === user.id) {
        // For team members, we need to mark the stage as forwarded to HR
        await applicationService.forwardStageToHR(id, stageNumber);
        alert('Stage forwarded to HR for review!');
      } else if ((user?.role === 'hr' || user?.role === 'admin') && status === 'pending') {
        // For HR/Admin, forward to next stage
        await applicationService.forwardStageToHR(id, stageNumber);
        alert('Stage forwarded to HR successfully!');
      }
      await fetchApplication(); // Refresh to get updated status
    } catch (error) {
      console.error('Error forwarding to HR:', error);
      alert('Error forwarding to HR. Please try again.');
    }
  };

  const handleApproveStage = async (stageNumber) => {
    try {
      await applicationService.approveStageByHR(id, stageNumber);
      alert('Stage approved and moved to next stage!');
      await fetchApplication(); // Refresh to get updated status
    } catch (error) {
      console.error('Error approving stage:', error);
      alert('Error approving stage. Please try again.');
    }
  };

  const handleRejectStage = async (stageNumber) => {
    try {
      const reason = prompt('Please provide a reason for rejecting this stage:');
      if (reason) {
        await applicationService.rejectStageByHR(id, stageNumber, reason);
        alert('Stage rejected!');
        await fetchApplication(); // Refresh to get updated status
      }
    } catch (error) {
      console.error('Error rejecting stage:', error);
      alert('Error rejecting stage. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Application</h3>
        <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
        <Link to="/app/applications" className="btn-primary">
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/app/applications"
            className="btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600 mt-1">Review and manage application</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Assignment History Button (Admin only) */}
          {(user?.role === 'hr' || user?.role === 'admin') && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="btn-secondary inline-flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </button>
          )}
          
          {/* Bulk Assignment Button */}
          {(user?.role === 'hr' || user?.role === 'admin') && getAvailableStagesForBulkAssignment().length > 1 && (
            <button
              onClick={() => setShowBulkAssignmentModal(true)}
              className="btn-primary inline-flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Bulk Assign Stages
            </button>
          )}
          
          {/* HR Assignment Button */}
          {(user?.role === 'hr' || user?.role === 'admin') && (
            <button
              onClick={() => {
                console.log('Opening assignment modal');
                setShowAssignmentModal(true);
              }}
              className="btn-primary inline-flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Assign Single Stage
            </button>
          )}
        </div>
      </div>

      {/* Application Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Candidate Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{application.name}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{application.email}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Mobile</p>
                <p className="text-gray-900">{application.mobile}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Applied Date</p>
                <p className="text-gray-900">
                  {new Date(application.date_of_application).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Position Applied For</p>
              <p className="text-gray-900">{application.job_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm font-medium text-gray-500">Current Stage</p>
            <p className="text-2xl font-bold text-primary-600">{application.current_stage}/7</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              application.status === 'completed' ? 'bg-green-100 text-green-800' :
              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {application.status}
            </span>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm font-medium text-gray-500">Created</p>
            <p className="text-sm text-gray-900">
              {new Date(application.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Summary - Only visible to Admin/HR */}
      {(user?.role === 'hr' || user?.role === 'admin') && (
        <FeedbackSummary application={application} />
      )}

      {/* Interview Stages with Assignment Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Interview Stages</h3>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <ProgressBar 
            current={getCompletedStagesCount()} 
            total={7}
            showLabel={true}
            showPercentage={true}
            size="md"
            color="green"
          />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((stageNumber) => {
            const status = getStageStatus(stageNumber);
            const assignee = getStageAssignee(stageNumber);
            const feedback = getStageFeedback(stageNumber);
            const isCurrentStage = application?.current_stage === stageNumber;
            
            return (
              <div 
                key={stageNumber} 
                className={`p-4 border rounded-lg transition-all ${
                  isCurrentStage ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      status === 'completed' ? 'bg-green-100 text-green-800' :
                      status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      status === 'forwarded' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {stageNumber}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{getStageName(stageNumber)}</p>
                        {isCurrentStage && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={status} size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons for Admin/HR */}
                  {(user?.role === 'hr' || user?.role === 'admin') && status === 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedStage(stageNumber);
                        setShowAssignmentModal(true);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Assign
                    </button>
                  )}
                  
                  {/* Action buttons for Team Members */}
                  {user?.role === 'team_member' && status === 'assigned' && assignee === user.id && (
                    <Link
                      to={`/app/applications/${id}/interview/${stageNumber}`}
                      className="btn-primary text-sm"
                    >
                      Conduct Interview
                    </Link>
                  )}
                  
                  {/* Action buttons for Team Members - Completed Stage */}
                  {user?.role === 'team_member' && status === 'completed' && assignee === user.id && (
                    <div className="flex space-x-2">
                      <Link
                        to={`/app/applications/${id}/interview/${stageNumber}`}
                        className="btn-secondary text-sm"
                      >
                        View Feedback
                      </Link>
                      <button
                        onClick={() => handleForwardToHR(stageNumber)}
                        className="btn-primary text-sm"
                      >
                        Forward to HR
                      </button>
                    </div>
                  )}
                  
                  {/* Action buttons for HR to review forwarded stages */}
                  {(user?.role === 'hr' || user?.role === 'admin') && status === 'forwarded' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveStage(stageNumber)}
                        className="btn-primary text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectStage(stageNumber)}
                        className="btn-danger text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {/* Action buttons for HR - Final Recommendation */}
                  {(user?.role === 'hr' || user?.role === 'admin') && 
                   stageNumber === 7 && 
                   status === 'completed' && (
                    <Link
                      to={`/app/applications/${id}/interview/${stageNumber}`}
                      className="btn-primary text-sm"
                    >
                      View Final Recommendation
                    </Link>
                  )}
                </div>
                
                {/* Assignment Info */}
                {assignee && (
                  <div className="ml-12 mb-2 space-y-1">
                    <p className="text-sm text-blue-600">
                      <span className="font-medium">Assigned to:</span> {getAssigneeName(assignee)}
                    </p>
                    {(() => {
                      const deadline = getStageDeadline(stageNumber);
                      const deadlineStatus = getDeadlineStatus(deadline);
                      
                      if (deadline && status !== 'completed') {
                        return (
                          <div className={`flex items-center text-sm ${
                            deadlineStatus === 'overdue' ? 'text-red-600' :
                            deadlineStatus === 'warning' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {deadlineStatus === 'overdue' ? (
                              <AlertTriangle className="h-4 w-4 mr-1" />
                            ) : deadlineStatus === 'warning' ? (
                              <AlertTriangle className="h-4 w-4 mr-1" />
                            ) : (
                              <ClockIcon className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-medium">
                              {deadlineStatus === 'overdue' ? 'Overdue: ' :
                               deadlineStatus === 'warning' ? 'Due soon: ' :
                               'Deadline: '}
                            </span>
                            {formatDeadline(deadline)}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
                
                {/* Feedback Summary for Completed Stages */}
                {feedback && status === 'completed' && (user?.role === 'hr' || user?.role === 'admin') && (
                  <div className="ml-12 mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Approval Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            feedback.approval_status === 'Approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {feedback.approval_status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Performance Rating</p>
                          <p className="text-sm font-medium text-gray-900">{feedback.performance_rating}/10</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewFeedback(stageNumber)}
                        className="btn-secondary text-sm ml-4"
                      >
                        View Full Feedback
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume */}
      {application.resume_filename && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resume</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{application.resume_filename}</p>
                <p className="text-sm text-gray-500">Resume file</p>
              </div>
            </div>
            <a
              href={`http://localhost:8000/uploads/${application.resume_filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Download
            </a>
          </div>
        </div>
      )}

      {/* Feedback View Modal */}
      <FeedbackViewModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        feedback={selectedFeedback?.feedback}
        stageNumber={selectedFeedback?.stageNumber}
        stageName={selectedFeedback?.stageNumber ? getStageName(selectedFeedback.stageNumber) : ''}
        submitterName={selectedFeedback?.feedback?.submitted_by ? getAssigneeName(selectedFeedback.feedback.submitted_by) : 'Unknown'}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        applicationId={id}
        stageNumber={selectedStage}
        onSuccess={handleAssignmentSuccess}
      />

      {/* Bulk Assignment Modal */}
      <BulkAssignmentModal
        isOpen={showBulkAssignmentModal}
        onClose={() => setShowBulkAssignmentModal(false)}
        applicationId={id}
        availableStages={getAvailableStagesForBulkAssignment()}
        onSuccess={handleAssignmentSuccess}
      />

      {/* Assignment History Modal */}
      <AssignmentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        applicationId={id}
      />
    </div>
  );
};

export default ApplicationDetail;