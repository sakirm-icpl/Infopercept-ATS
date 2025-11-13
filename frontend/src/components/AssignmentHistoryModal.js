import { useState, useEffect } from 'react';
import { X, User, Clock, CheckCircle, AlertCircle, ArrowRight, Calendar } from 'lucide-react';
import { applicationService } from '../services/applicationService';

const AssignmentHistoryModal = ({ isOpen, onClose, applicationId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchAssignmentHistory();
    }
  }, [isOpen, applicationId]);

  const fetchAssignmentHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await applicationService.getStageAssignments(applicationId);
      setAssignments(response.assignments || []);
    } catch (err) {
      console.error('Error fetching assignment history:', err);
      setError('Failed to load assignment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'assigned':
        return <User className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalStatusColor = (approvalStatus) => {
    return approvalStatus === 'Approved'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assignment History</h2>
            <p className="text-sm text-gray-600 mt-1">Complete timeline of all stage assignments</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && assignments.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No assignment history found</p>
            </div>
          )}

          {!loading && !error && assignments.length > 0 && (
            <div className="space-y-6">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Assignment items */}
                <div className="space-y-6">
                  {assignments.map((assignment, index) => (
                    <div key={assignment.id} className="relative pl-16">
                      {/* Timeline dot */}
                      <div className="absolute left-3 top-2 w-6 h-6 rounded-full bg-white border-2 border-primary-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                      </div>

                      {/* Assignment card */}
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {assignment.stage_name}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(assignment.status)}`}>
                                  {assignment.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">Stage {assignment.stage_number}</p>
                            </div>
                            {getStatusIcon(assignment.status)}
                          </div>

                          {/* Assignment details */}
                          <div className="space-y-2">
                            {/* Assigned to */}
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">Assigned to:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {assignment.assigned_to_name || 'Unknown'}
                              </span>
                              {assignment.assigned_to_email && (
                                <span className="ml-2 text-gray-500">
                                  ({assignment.assigned_to_email})
                                </span>
                              )}
                            </div>

                            {/* Assigned by */}
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">Assigned by:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {assignment.assigned_by_name || 'Unknown'}
                              </span>
                            </div>

                            {/* Assigned at */}
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">Assigned at:</span>
                              <span className="ml-2 text-gray-900">
                                {formatDate(assignment.assigned_at)}
                              </span>
                            </div>

                            {/* Deadline */}
                            {assignment.deadline && (
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">Deadline:</span>
                                <span className="ml-2 text-gray-900">
                                  {formatDate(assignment.deadline)}
                                </span>
                              </div>
                            )}

                            {/* Reassignment info */}
                            {assignment.reassigned_from && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center text-sm">
                                  <ArrowRight className="h-4 w-4 text-yellow-600 mr-2" />
                                  <span className="text-yellow-800 font-medium">Reassigned from:</span>
                                  <span className="ml-2 text-yellow-900">
                                    {assignment.reassigned_from_name || 'Unknown'}
                                  </span>
                                </div>
                                {assignment.reassignment_reason && (
                                  <p className="text-sm text-yellow-800 mt-1 ml-6">
                                    Reason: {assignment.reassignment_reason}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Notes */}
                            {assignment.notes && (
                              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {assignment.notes}
                                </p>
                              </div>
                            )}

                            {/* Feedback info (if completed) */}
                            {assignment.status === 'completed' && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="space-y-2">
                                  {assignment.feedback_submitted_at && (
                                    <div className="flex items-center text-sm">
                                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                      <span className="text-green-800 font-medium">Feedback submitted:</span>
                                      <span className="ml-2 text-green-900">
                                        {formatDate(assignment.feedback_submitted_at)}
                                      </span>
                                    </div>
                                  )}
                                  {assignment.feedback_approval_status && (
                                    <div className="flex items-center text-sm">
                                      <span className="text-green-800 font-medium mr-2">Status:</span>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getApprovalStatusColor(assignment.feedback_approval_status)}`}>
                                        {assignment.feedback_approval_status}
                                      </span>
                                    </div>
                                  )}
                                  {assignment.feedback_rating && (
                                    <div className="flex items-center text-sm">
                                      <span className="text-green-800 font-medium mr-2">Rating:</span>
                                      <span className="text-green-900">
                                        {assignment.feedback_rating}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Completed at */}
                            {assignment.completed_at && (
                              <div className="flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">Completed at:</span>
                                <span className="ml-2 text-gray-900">
                                  {formatDate(assignment.completed_at)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentHistoryModal;
