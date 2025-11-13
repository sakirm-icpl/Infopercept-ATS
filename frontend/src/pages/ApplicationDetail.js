import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import { interviewService } from '../services/interviewService';
import { userService } from '../services/userService';
import { ArrowLeft, FileText, User, Mail, Phone, Calendar, Users, Send } from 'lucide-react';

const ApplicationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(1);
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

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

  const handleAssignStage = async () => {
    if (!selectedTeamMember) {
      setError('Please select a team member');
      return;
    }

    setAssigning(true);
    setError('');

    try {
      const assignmentData = {
        stage_number: selectedStage,
        assigned_to: selectedTeamMember,
        notes: assignmentNotes
      };

      await interviewService.assignStage(id, assignmentData);
      
      // Refresh application data
      await fetchApplication();
      
      // Reset form
      setShowAssignmentModal(false);
      setSelectedStage(1);
      setSelectedTeamMember('');
      setAssignmentNotes('');
      
      alert('Stage assigned successfully!');
    } catch (error) {
      setError('Failed to assign stage: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAssigning(false);
    }
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
            Assign to Team Member
          </button>
        )}
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

      {/* Interview Stages with Assignment Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Stages</h3>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((stageNumber) => {
            const status = getStageStatus(stageNumber);
            const assignee = getStageAssignee(stageNumber);
            
            return (
              <div key={stageNumber} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    status === 'forwarded' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {stageNumber}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getStageName(stageNumber)}</p>
                    <p className="text-sm text-gray-500 capitalize">{status}</p>
                    {assignee && (
                      <p className="text-xs text-blue-600">
                        Assigned to: {assignee === user?.id ? 'You' : `User ID: ${assignee}`}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action buttons for HR */}
                {(user?.role === 'hr' || user?.role === 'admin') && status === 'pending' && (
                  <button
                    onClick={() => {
                      console.log('Opening assignment modal for stage:', stageNumber);
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
                  <div className="flex space-x-2">
                    <Link
                      to={`/app/applications/${id}/interview/${stageNumber}`}
                      className="btn-primary text-sm"
                    >
                      Conduct Interview
                    </Link>
                  </div>
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
                  <div className="flex space-x-2">
                    <Link
                      to={`/app/applications/${id}/interview/${stageNumber}`}
                      className="btn-primary text-sm"
                    >
                      View Final Recommendation
                    </Link>
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

      {/* Assignment Modal */}
      {console.log('Show assignment modal:', showAssignmentModal)}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assign Stage to Team Member</h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(parseInt(e.target.value))}
                  className="form-select w-full"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
                    <option key={stage} value={stage}>
                      {getStageName(stage)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member
                </label>
                <select
                  value={selectedTeamMember}
                  onChange={(e) => setSelectedTeamMember(e.target.value)}
                  className="form-select w-full"
                >
                  <option value="">Select a team member</option>
                  {console.log('Team members array:', teamMembers)}
                  {teamMembers.length === 0 ? (
                    <option value="">No team members available</option>
                  ) : (
                    teamMembers.map((member) => {
                      console.log('Rendering team member option:', member);
                      return (
                        <option key={member.id} value={member.id}>
                          {member.username} - {member.role.charAt(0).toUpperCase() + member.role.slice(1)} ({member.email})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="form-textarea w-full"
                  rows="3"
                  placeholder="Add any notes for the team member..."
                />
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="btn-secondary flex-1"
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStage}
                className="btn-primary flex-1 inline-flex items-center justify-center"
                disabled={assigning}
              >
                {assigning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Assign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;