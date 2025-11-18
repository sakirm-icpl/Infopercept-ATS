import { useState, useEffect, useRef } from 'react';
import { Send, X, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { interviewService } from '../services/interviewService';
import { useNotification } from './Notification';
import { getErrorMessage } from '../utils/errorMessages';
import { RetryManager } from '../utils/retryHelper';

const BulkAssignmentModal = ({ 
  isOpen, 
  onClose, 
  applicationId, 
  availableStages,
  onSuccess 
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [selectedStages, setSelectedStages] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryState, setRetryState] = useState({ isRetrying: false, currentAttempt: 0, maxRetries: 3 });
  const [lastFailedRequest, setLastFailedRequest] = useState(null);
  const retryManagerRef = useRef(new RetryManager());

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      setSelectedStages([]);
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      const data = await userService.getTeamMembersForAssignment();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      const errorMessage = getErrorMessage(error);
      addNotification({
        type: 'error',
        title: 'Failed to Load Team Members',
        message: errorMessage,
        duration: 5000
      });
    }
  };

  const getStageName = (stageNum) => {
    const stages = {
      1: 'Resume Screening',
      2: 'HR Telephonic Interview',
      3: 'Practical Lab Test',
      4: 'Technical Interview',
      5: 'BU Lead Round',
      6: 'HR Head Round',
      7: 'CEO Round'
    };
    return stages[stageNum] || `Stage ${stageNum}`;
  };

  const toggleStageSelection = (stageNumber) => {
    setSelectedStages(prev => {
      if (prev.includes(stageNumber)) {
        return prev.filter(s => s !== stageNumber);
      } else {
        return [...prev, stageNumber];
      }
    });
  };

  const selectAllStages = () => {
    if (selectedStages.length === availableStages.length) {
      setSelectedStages([]);
    } else {
      setSelectedStages([...availableStages]);
    }
  };

  const performBulkAssignment = async () => {
    const bulkAssignmentData = {
      stage_numbers: selectedStages,
      assigned_to: selectedTeamMember,
      notes: notes || undefined,
      // send the selected date (YYYY-MM-DD). backend accepts date or datetime and will normalize.
      deadline: deadline || undefined
    };

    return await interviewService.bulkAssignStages(applicationId, bulkAssignmentData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTeamMember) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a team member',
        duration: 4000
      });
      return;
    }

    if (selectedStages.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select at least one stage',
        duration: 4000
      });
      return;
    }

    setLoading(true);
    setLastFailedRequest(null);

    try {
      await retryManagerRef.current.execute(performBulkAssignment, {
        maxRetries: 3,
        onRetry: (attempt, max, delay) => {
          setRetryState({ isRetrying: true, currentAttempt: attempt, maxRetries: max });
          addNotification({
            type: 'info',
            title: 'Retrying Request',
            message: `Attempt ${attempt} of ${max}. Retrying in ${delay / 1000} seconds...`,
            duration: 3000
          });
        },
        onSuccess: (response) => {
          setRetryState({ isRetrying: false, currentAttempt: 0, maxRetries: 3 });
          
          const successCount = response.result.success_count;
          const totalCount = response.result.total_requested;
          
          if (successCount === totalCount) {
            addNotification({
              type: 'success',
              title: 'Bulk Assignment Successful',
              message: `Successfully assigned ${successCount} stage${successCount > 1 ? 's' : ''}!`,
              duration: 3000
            });
          } else {
            addNotification({
              type: 'warning',
              title: 'Partial Success',
              message: `Assigned ${successCount} of ${totalCount} stages. Some stages could not be assigned.`,
              duration: 5000
            });
          }
          
          // Reset form
          setSelectedTeamMember('');
          setSelectedStages([]);
          setDeadline('');
          setNotes('');
          
          // Call success callback after a short delay
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 500);
        },
        onError: (error) => {
          setRetryState({ isRetrying: false, currentAttempt: 0, maxRetries: 3 });
          setLastFailedRequest(performBulkAssignment);
          
          console.error('Error bulk assigning stages:', error);
          const errorMessage = getErrorMessage(error);
          addNotification({
            type: 'error',
            title: 'Bulk Assignment Failed',
            message: errorMessage,
            duration: 5000
          });
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRetry = async () => {
    if (!lastFailedRequest) return;
    
    setLoading(true);
    setLastFailedRequest(null);

    try {
      const response = await lastFailedRequest();
      
      const successCount = response.result.success_count;
      const totalCount = response.result.total_requested;
      
      if (successCount === totalCount) {
        addNotification({
          type: 'success',
          title: 'Bulk Assignment Successful',
          message: `Successfully assigned ${successCount} stage${successCount > 1 ? 's' : ''}!`,
          duration: 3000
        });
      } else {
        addNotification({
          type: 'warning',
          title: 'Partial Success',
          message: `Assigned ${successCount} of ${totalCount} stages. Some stages could not be assigned.`,
          duration: 5000
        });
      }
      
      // Reset form
      setSelectedTeamMember('');
      setSelectedStages([]);
      setDeadline('');
      setNotes('');
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error on manual retry:', error);
      const errorMessage = getErrorMessage(error);
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: errorMessage,
        duration: 5000
      });
      setLastFailedRequest(performBulkAssignment);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedTeamMember('');
      setSelectedStages([]);
      setDeadline('');
      setNotes('');
      onClose();
    }
  };

  if (!isOpen) return null;

  // Role-based access control - only admin and hr can assign stages
  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">🚫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              Only administrators and HR can assign stages to team members.
            </p>
            <button onClick={handleClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Bulk Assign Stages to Team Member
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stage Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Stages <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={selectAllStages}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={loading}
              >
                {selectedStages.length === availableStages.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
              {availableStages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No pending stages available for assignment
                </p>
              ) : (
                availableStages.map((stageNumber) => (
                  <div
                    key={stageNumber}
                    onClick={() => toggleStageSelection(stageNumber)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStages.includes(stageNumber)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="mr-3">
                      {selectedStages.includes(stageNumber) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Stage {stageNumber}: {getStageName(stageNumber)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {selectedStages.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {selectedStages.length} stage{selectedStages.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          
          {/* Team Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Member <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeamMember}
              onChange={(e) => setSelectedTeamMember(e.target.value)}
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select a team member...</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username} - {member.role.charAt(0).toUpperCase() + member.role.slice(1)} ({member.email})
                </option>
              ))}
            </select>
          </div>
          
          {/* Deadline (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Set a deadline for all selected stages
            </p>
          </div>
          
          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              maxLength={500}
              placeholder="Add any notes or instructions for the team member..."
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {notes.length}/500 characters
            </p>
          </div>
          
          {/* Retry Status */}
          {retryState.isRetrying && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
              <RefreshCw className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
              <span className="text-sm text-blue-800">
                Retrying... Attempt {retryState.currentAttempt} of {retryState.maxRetries}
              </span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            {lastFailedRequest && !loading && (
              <button
                type="button"
                onClick={handleManualRetry}
                className="btn-secondary flex-1 inline-flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            )}
            <button
              type="submit"
              className="btn-primary flex-1 inline-flex items-center justify-center"
              disabled={loading || selectedStages.length === 0}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Assign {selectedStages.length > 0 ? `${selectedStages.length} Stage${selectedStages.length > 1 ? 's' : ''}` : 'Stages'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAssignmentModal;
