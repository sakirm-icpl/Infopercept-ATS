import { X, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeedbackViewModal = ({ 
  isOpen, 
  onClose, 
  feedback, 
  stageNumber, 
  stageName,
  submitterName,
  applicationId
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!isOpen || !feedback) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'hr';

  const handleEdit = () => {
    onClose();
    navigate(`/app/applications/${applicationId}/feedback/${stageNumber}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Feedback - Stage {stageNumber}: {stageName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Approval Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Status
            </label>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              feedback.approval_status === 'Approved' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {feedback.approval_status}
            </span>
          </div>
          
          {/* Performance Rating */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Performance Rating
            </label>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-900">
                {feedback.performance_rating}/10
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${feedback.performance_rating * 10}%` }}
                  role="progressbar"
                  aria-valuenow={feedback.performance_rating}
                  aria-valuemin="1"
                  aria-valuemax="10"
                />
              </div>
            </div>
          </div>
          
          {/* Comments */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments
            </label>
            <p className="text-gray-900 whitespace-pre-wrap">{feedback.comments}</p>
          </div>
          
          {/* Submitter Information */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Submitted by</p>
                <p className="font-medium text-gray-900">
                  {submitterName || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Submitted at</p>
                <p className="font-medium text-gray-900">
                  {feedback.submitted_at 
                    ? new Date(feedback.submitted_at).toLocaleString() 
                    : 'Unknown'}
                </p>
              </div>
              {feedback.edited_at && (
                <>
                  <div>
                    <p className="text-gray-600">Last edited</p>
                    <p className="font-medium text-gray-900">
                      {new Date(feedback.edited_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Edit count</p>
                    <p className="font-medium text-gray-900">{feedback.edit_count || 0}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          {canEdit && (
            <button
              onClick={handleEdit}
              className="btn-primary inline-flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackViewModal;
