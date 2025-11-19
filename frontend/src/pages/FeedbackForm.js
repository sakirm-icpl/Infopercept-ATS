import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import StatusBadge from '../components/StatusBadge';
import { useNotification } from '../components/Notification';
import { getErrorMessage, VALIDATION_MESSAGES } from '../utils/errorMessages';
import { RetryManager } from '../utils/retryHelper';
import { RefreshCw } from 'lucide-react';

const FeedbackForm = () => {
  const { id, stage } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [application, setApplication] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [performanceRating, setPerformanceRating] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [feedbackMeta, setFeedbackMeta] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isAssigned, setIsAssigned] = useState(false);
  const [checkingAssignment, setCheckingAssignment] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [retryState, setRetryState] = useState({ isRetrying: false, currentAttempt: 0, maxRetries: 3 });
  const [lastFailedRequest, setLastFailedRequest] = useState(null);
  
  const templateDropdownRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);
  const retryManagerRef = useRef(new RetryManager());
  const stageNumber = parseInt(stage);
  
  // Draft key for localStorage
  const getDraftKey = () => `feedback_draft_${id}_${stageNumber}`;

  useEffect(() => {
    loadApplication();
    loadExistingFeedback();
    verifyAssignment();
    loadTemplates();
    loadDraft();
  }, [id, stage]);
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isReadOnly && (approvalStatus || performanceRating || comments)) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveDraft();
      }, 30000); // 30 seconds
      
      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [approvalStatus, performanceRating, comments, isReadOnly]);
  
  // Save draft when form values change (debounced via interval)
  useEffect(() => {
    if (!isReadOnly && (approvalStatus || performanceRating || comments)) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 2000); // Save after 2 seconds of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [approvalStatus, performanceRating, comments, isReadOnly]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target)) {
        setShowTemplateDropdown(false);
      }
    };

    if (showTemplateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplateDropdown]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/applications/${id}`);
      setApplication(response.data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      addNotification({
        type: 'error',
        title: 'Failed to Load Application',
        message: errorMessage,
        duration: 5000
      });
      console.error('Error loading application:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyAssignment = async () => {
    try {
      setCheckingAssignment(true);
      
      // Admin and HR can always view feedback (read-only)
      if (user?.role === 'admin' || user?.role === 'hr') {
        setIsAssigned(true);
        setCheckingAssignment(false);
        return;
      }
      
      // For team members, verify they are assigned to this stage
      // Check both the application stages field AND the stage_assignments collection
      try {
        // First, try to get assignments from the API
        const assignmentsResponse = await apiClient.get(`/api/interviews/applications/${id}/assignments`);
        const assignments = assignmentsResponse.data;
        
        // Check if user is assigned to this stage
        const userAssignment = assignments.find(
          a => a.stage_number === stageNumber && a.assigned_to === user?.id
        );
        
        if (userAssignment) {
          setIsAssigned(true);
          setCheckingAssignment(false);
          return;
        }
      } catch (assignmentErr) {
        console.log('Could not fetch assignments, falling back to application check:', assignmentErr);
      }
      
      // Fallback: Check the application document
      const response = await apiClient.get(`/api/applications/${id}`);
      const app = response.data;
      
      const assignedToField = `stage${stageNumber}_assigned_to`;
      const assignedUserId = app.stages?.[assignedToField];
      
      if (assignedUserId === user?.id) {
        setIsAssigned(true);
      } else {
        setIsAssigned(false);
        addNotification({
          type: 'error',
          title: 'Access Denied',
          message: 'You are not assigned to this stage.',
          duration: 5000
        });
      }
    } catch (err) {
      console.error('Error verifying assignment:', err);
      const errorMessage = getErrorMessage(err);
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: errorMessage,
        duration: 5000
      });
      setIsAssigned(false);
    } finally {
      setCheckingAssignment(false);
    }
  };

  const loadExistingFeedback = async () => {
    try {
      const response = await apiClient.get(`/api/applications/${id}/stage/${stageNumber}/feedback`);
      const feedbackData = response.data.feedback;
      
      if (feedbackData) {
        setApprovalStatus(feedbackData.approval_status || '');
        setPerformanceRating(feedbackData.performance_rating?.toString() || '');
        setComments(feedbackData.comments || '');
        
        // Store metadata including submitter info
        setFeedbackMeta({
          submitted_by: feedbackData.submitted_by_username || feedbackData.submitted_by || 'Unknown',
          submitted_at: feedbackData.submitted_at,
          edited_at: feedbackData.edited_at,
          edit_count: feedbackData.edit_count || 0
        });
        
        // Check if user can edit this feedback
        const canEditFeedback = feedbackData.can_edit || false;
        setCanEdit(canEditFeedback);
        
        // Check if read-only (admin viewing or completed by someone else)
        const isAdmin = user.role === 'admin' || user.role === 'hr';
        const isOwnFeedback = feedbackData.submitted_by === user.id;
        
        if (isAdmin || (feedbackData.submitted_by && !isOwnFeedback)) {
          setIsReadOnly(true);
        } else if (isOwnFeedback && !canEditFeedback) {
          // Own feedback but edit window expired
          setIsReadOnly(true);
        }
      }
    } catch (err) {
      // If 404, no feedback exists yet - that's okay
      if (err.response?.status !== 404) {
        console.error('Error loading feedback:', err);
      }
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await apiClient.get('/api/applications/feedback/templates');
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      // Don't show error to user - templates are optional
    }
  };
  
  const saveDraft = () => {
    try {
      const draft = {
        approvalStatus,
        performanceRating,
        comments,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(getDraftKey(), JSON.stringify(draft));
      console.log('Draft saved automatically');
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };
  
  const loadDraft = () => {
    try {
      const draftKey = getDraftKey();
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        // Only load draft if form is empty (no existing feedback)
        if (!approvalStatus && !performanceRating && !comments) {
          setApprovalStatus(draft.approvalStatus || '');
          setPerformanceRating(draft.performanceRating || '');
          setComments(draft.comments || '');
          console.log('Draft restored from', new Date(draft.savedAt).toLocaleString());
        }
      }
    } catch (err) {
      console.error('Error loading draft:', err);
    }
  };
  
  const clearDraft = () => {
    try {
      localStorage.removeItem(getDraftKey());
      console.log('Draft cleared');
    } catch (err) {
      console.error('Error clearing draft:', err);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setComments(template.content);
      setSelectedTemplateId(templateId);
      setShowTemplateDropdown(false);
    }
  };

  const getStageName = (stageNum) => {
    const stages = {
      1: 'HR Screening',
      2: 'Practical Lab Test',
      3: 'Technical Interview',
      4: 'HR Round',
      5: 'BU Lead Interview',
      6: 'CEO Interview',
      7: 'Final Recommendation & Offer'
    };
    return stages[stageNum] || `Stage ${stageNum}`;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!approvalStatus) {
      errors.approvalStatus = VALIDATION_MESSAGES.approvalStatus.required;
    }
    
    if (!performanceRating) {
      errors.performanceRating = VALIDATION_MESSAGES.performanceRating.required;
    } else {
      const rating = parseInt(performanceRating);
      if (isNaN(rating)) {
        errors.performanceRating = VALIDATION_MESSAGES.performanceRating.invalid;
      } else if (rating < 1 || rating > 10) {
        errors.performanceRating = VALIDATION_MESSAGES.performanceRating.range;
      }
    }
    
    if (!comments || comments.trim() === '') {
      errors.comments = VALIDATION_MESSAGES.comments.required;
    } else if (comments.length > 1000) {
      errors.comments = VALIDATION_MESSAGES.comments.maxLength;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsReadOnly(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsReadOnly(true);
    // Reload the original feedback
    loadExistingFeedback();
  };

  const performFeedbackSubmission = async () => {
    const feedbackData = {
      approval_status: approvalStatus,
      performance_rating: parseInt(performanceRating),
      comments: comments.trim()
    };

    return await apiClient.post(
      `/api/applications/${id}/stage/${stageNumber}/feedback`,
      feedbackData
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the validation errors before submitting',
        duration: 4000
      });
      return;
    }

    setSubmitting(true);
    setLastFailedRequest(null);

    try {
      await retryManagerRef.current.execute(performFeedbackSubmission, {
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
        onSuccess: async () => {
          setRetryState({ isRetrying: false, currentAttempt: 0, maxRetries: 3 });
          
          const successMessage = isEditing ? 'Feedback updated successfully!' : 'Feedback submitted successfully!';
          addNotification({
            type: 'success',
            title: 'Success',
            message: successMessage,
            duration: 3000
          });
          
          // Clear draft after successful submission
          clearDraft();
          
          // Reload feedback to get updated metadata
          await loadExistingFeedback();
          setIsEditing(false);
          
          // Navigate back to My Assignments after a short delay
          setTimeout(() => {
            navigate('/app/my-assignments');
          }, 1000);
        },
        onError: (err) => {
          setRetryState({ isRetrying: false, currentAttempt: 0, maxRetries: 3 });
          setLastFailedRequest(performFeedbackSubmission);
          
          const errorMessage = getErrorMessage(err);
          addNotification({
            type: 'error',
            title: 'Submission Failed',
            message: errorMessage,
            duration: 5000
          });
          console.error('Error submitting feedback:', err);
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualRetry = async () => {
    if (!lastFailedRequest) return;
    
    setSubmitting(true);
    setLastFailedRequest(null);

    try {
      await lastFailedRequest();
      
      const successMessage = isEditing ? 'Feedback updated successfully!' : 'Feedback submitted successfully!';
      addNotification({
        type: 'success',
        title: 'Success',
        message: successMessage,
        duration: 3000
      });
      
      // Clear draft after successful submission
      clearDraft();
      
      // Reload feedback to get updated metadata
      await loadExistingFeedback();
      setIsEditing(false);
      
      // Navigate back to My Assignments after a short delay
      setTimeout(() => {
        navigate('/app/my-assignments');
      }, 1000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: errorMessage,
        duration: 5000
      });
      console.error('Error on manual retry:', err);
      setLastFailedRequest(performFeedbackSubmission);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Navigate based on user role
    if (user?.role === 'admin' || user?.role === 'hr') {
      navigate(`/app/applications/${id}`);
    } else {
      navigate('/app/my-assignments');
    }
  };

  if (loading || checkingAssignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if user is not assigned to this stage (for team members)
  if (!isAssigned && user?.role === 'team_member') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You are not assigned to this stage. Only team members assigned to this stage can submit feedback.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/app/my-assignments')} className="w-full">
              Go to My Assignments
            </Button>
            <Button onClick={() => navigate('/app/dashboard')} variant="secondary" className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <Button onClick={handleCancel}>
            Back to My Assignments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {isReadOnly ? 'View Feedback' : 'Submit Feedback'} - Stage {stageNumber}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">{getStageName(stageNumber)}</p>
      </div>

      {/* Application Info */}
      <Card className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Candidate Information</h3>
            <p className="text-sm sm:text-base mb-1"><strong>Name:</strong> {application.name}</p>
            <p className="text-sm sm:text-base mb-1"><strong>Email:</strong> {application.email}</p>
            <p className="text-sm sm:text-base"><strong>Mobile:</strong> {application.mobile}</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Application Status</h3>
            <p className="text-sm sm:text-base mb-1"><strong>Current Stage:</strong> {application.current_stage}</p>
            <p className="text-sm sm:text-base mb-1"><strong>Status:</strong> <StatusBadge status={application.status} /></p>
            <p className="text-sm sm:text-base"><strong>Applied:</strong> {new Date(application.date_of_application).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>



      {/* Feedback Form */}
      <Card>
        {isReadOnly && (user?.role === 'admin' || user?.role === 'hr') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Admin/HR View
                </p>
                <p className="text-xs text-blue-700">
                  As an {user?.role === 'admin' ? 'administrator' : 'HR member'}, you can edit this feedback.
                </p>
              </div>
            </div>
            {!isEditing && (
              <Button
                type="button"
                onClick={handleEdit}
                variant="primary"
                className="ml-4"
              >
                Edit Feedback
              </Button>
            )}
          </div>
        )}
        {isReadOnly && user?.role === 'team_member' && !canEdit && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium">
              View Only - This feedback has been submitted and the edit window has expired
            </p>
          </div>
        )}
        {canEdit && !isEditing && user?.role === 'team_member' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-green-800 font-medium">
                  Edit Window Active
                </p>
                <p className="text-xs text-green-700">
                  You can edit this feedback within 30 minutes of submission (max 3 edits)
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleEdit}
              variant="primary"
              className="ml-4"
            >
              Edit Feedback
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Approval Status */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Approval Status <span className="text-red-500">*</span>
            </label>
            <select
              value={approvalStatus}
              onChange={(e) => {
                setApprovalStatus(e.target.value);
                if (validationErrors.approvalStatus) {
                  setValidationErrors({ ...validationErrors, approvalStatus: undefined });
                }
              }}
              className={`form-select w-full px-4 py-3 sm:py-4 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.approvalStatus ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isReadOnly || submitting}
              style={{ minHeight: '48px' }}
            >
              <option value="">Select approval status...</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            {validationErrors.approvalStatus && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.approvalStatus}</p>
            )}
          </div>

          {/* Performance Rating */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Performance Rating (1-10) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              max="10"
              value={performanceRating}
              onChange={(e) => {
                setPerformanceRating(e.target.value);
                if (validationErrors.performanceRating) {
                  setValidationErrors({ ...validationErrors, performanceRating: undefined });
                }
              }}
              className={`form-input w-full px-4 py-3 sm:py-4 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.performanceRating ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter rating from 1 to 10"
              required
              disabled={isReadOnly || submitting}
              style={{ minHeight: '48px' }}
            />
            <div className="mt-2 flex justify-between text-xs sm:text-sm text-gray-500">
              <span>1 (Poor)</span>
              <span className="hidden sm:inline">5 (Average)</span>
              <span>10 (Excellent)</span>
            </div>
            {validationErrors.performanceRating && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.performanceRating}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Comments <span className="text-red-500">*</span>
              </label>
              {!isReadOnly && templates.length > 0 && (
                <div className="relative" ref={templateDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    disabled={submitting}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Use Template
                  </button>
                  
                  {showTemplateDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-900">Select a Template</h4>
                        <p className="text-xs text-gray-600 mt-1">Choose a template to populate the comments field</p>
                      </div>
                      
                      {/* Group templates by category */}
                      {['strong_candidate', 'needs_improvement', 'not_suitable', 'neutral'].map(categoryKey => {
                        const categoryTemplates = templates.filter(t => t.category_key === categoryKey);
                        if (categoryTemplates.length === 0) return null;
                        
                        return (
                          <div key={categoryKey} className="border-b border-gray-100 last:border-b-0">
                            <div className="px-3 py-2 bg-gray-50">
                              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                {categoryTemplates[0].category_name}
                              </h5>
                            </div>
                            <div className="py-1">
                              {categoryTemplates.map(template => (
                                <button
                                  key={template.id}
                                  type="button"
                                  onClick={() => handleTemplateSelect(template.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors duration-150"
                                >
                                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">{template.content}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="p-2 bg-gray-50 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowTemplateDropdown(false)}
                          className="w-full text-sm text-gray-600 hover:text-gray-800 py-1"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {selectedTemplateId && !isReadOnly && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                <div className="flex items-center text-sm text-green-800">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Template applied - You can edit the text below
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId('');
                    setComments('');
                  }}
                  className="text-xs text-green-700 hover:text-green-900 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
            
            <textarea
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (validationErrors.comments) {
                  setValidationErrors({ ...validationErrors, comments: undefined });
                }
              }}
              className={`form-textarea w-full px-4 py-3 sm:py-4 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.comments ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={6}
              maxLength={1000}
              placeholder="Provide detailed feedback about the candidate's performance..."
              required
              disabled={isReadOnly || submitting}
              style={{ minHeight: '120px' }}
            />
            <div className="mt-1 flex justify-between items-center">
              <div>
                {validationErrors.comments && (
                  <p className="text-sm text-red-600">{validationErrors.comments}</p>
                )}
              </div>
              <p className={`text-xs ${comments.length > 950 ? 'text-red-600' : 'text-gray-500'}`}>
                {comments.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Feedback Metadata (for read-only view) */}
          {isReadOnly && feedbackMeta && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Submission Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Submitted by:</strong> {feedbackMeta.submitted_by}</p>
                <p><strong>Submitted at:</strong> {new Date(feedbackMeta.submitted_at).toLocaleString()}</p>
                {feedbackMeta.edited_at && (
                  <p className="flex items-center text-orange-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <strong>Edited:</strong> {new Date(feedbackMeta.edited_at).toLocaleString()} 
                    {feedbackMeta.edit_count > 0 && ` (${feedbackMeta.edit_count} time${feedbackMeta.edit_count > 1 ? 's' : ''})`}
                  </p>
                )}
              </div>
            </div>
          )}

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
          {!isReadOnly && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t">
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[48px]"
                >
                  Cancel Edit
                </Button>
              )}
              {!isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[48px]"
                >
                  Cancel
                </Button>
              )}
              {lastFailedRequest && !submitting && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleManualRetry}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-h-[48px]"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Submitting...'}
                  </div>
                ) : (
                  isEditing ? 'Update Feedback' : 'Submit Feedback'
                )}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex justify-end pt-6 border-t">
              <Button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto min-h-[48px]"
              >
                {user?.role === 'admin' || user?.role === 'hr' ? 'Back to Application' : 'Back to My Assignments'}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default FeedbackForm;
