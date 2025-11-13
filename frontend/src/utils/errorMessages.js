/**
 * Centralized error message mapping for user-friendly error handling
 * Maps backend error codes and messages to user-friendly messages
 */

export const ERROR_MESSAGES = {
  // Assignment Errors
  STAGE_ALREADY_ASSIGNED: 'This stage has already been assigned to another team member.',
  STAGE_NOT_PENDING: 'This stage cannot be assigned because it is not in pending status.',
  TEAM_MEMBER_NOT_FOUND: 'The selected team member could not be found.',
  APPLICATION_NOT_FOUND: 'The application could not be found.',
  INVALID_STAGE_NUMBER: 'Invalid stage number. Stage must be between 1 and 7.',
  
  // Feedback Errors
  NOT_ASSIGNED: 'You are not assigned to this stage. Only assigned team members can submit feedback.',
  INVALID_APPROVAL_STATUS: 'Please select a valid approval status (Approved or Rejected).',
  INVALID_RATING: 'Performance rating must be a number between 1 and 10.',
  RATING_OUT_OF_RANGE: 'Performance rating must be between 1 and 10.',
  COMMENTS_REQUIRED: 'Comments are required. Please provide detailed feedback.',
  COMMENTS_TOO_LONG: 'Comments must not exceed 1000 characters.',
  EDIT_WINDOW_EXPIRED: 'The edit window has expired. You can no longer modify this feedback.',
  MAX_EDITS_REACHED: 'You have reached the maximum number of edits (3) for this feedback.',
  FEEDBACK_NOT_FOUND: 'Feedback not found for this stage.',
  
  // Authorization Errors
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  ADMIN_ONLY: 'This action requires administrator privileges.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  INVALID_TOKEN: 'Your session has expired. Please log in again.',
  
  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Validation Errors
  APPROVAL_STATUS_REQUIRED: 'Approval status is required.',
  PERFORMANCE_RATING_REQUIRED: 'Performance rating is required.',
  PERFORMANCE_RATING_INVALID: 'Performance rating must be a valid number.',
  PERFORMANCE_RATING_RANGE: 'Performance rating must be between 1 and 10.',
  COMMENTS_EMPTY: 'Comments are required.',
  COMMENTS_LENGTH: 'Comments must not exceed 1000 characters.',
  TEAM_MEMBER_REQUIRED: 'Please select a team member.',
  
  // Generic Errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
};

/**
 * Maps backend error details to user-friendly messages
 * @param {string} errorDetail - Error detail from backend
 * @returns {string} User-friendly error message
 */
export const mapErrorMessage = (errorDetail) => {
  if (!errorDetail) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  const detail = errorDetail.toLowerCase();

  // Assignment errors
  if (detail.includes('already assigned')) {
    return ERROR_MESSAGES.STAGE_ALREADY_ASSIGNED;
  }
  if (detail.includes('not in pending status') || detail.includes('not pending')) {
    return ERROR_MESSAGES.STAGE_NOT_PENDING;
  }
  if (detail.includes('team member not found')) {
    return ERROR_MESSAGES.TEAM_MEMBER_NOT_FOUND;
  }
  if (detail.includes('application not found')) {
    return ERROR_MESSAGES.APPLICATION_NOT_FOUND;
  }
  if (detail.includes('invalid stage number')) {
    return ERROR_MESSAGES.INVALID_STAGE_NUMBER;
  }

  // Feedback errors
  if (detail.includes('not assigned')) {
    return ERROR_MESSAGES.NOT_ASSIGNED;
  }
  if (detail.includes('approval status')) {
    return ERROR_MESSAGES.INVALID_APPROVAL_STATUS;
  }
  if (detail.includes('rating') && (detail.includes('between') || detail.includes('range'))) {
    return ERROR_MESSAGES.RATING_OUT_OF_RANGE;
  }
  if (detail.includes('rating') && detail.includes('number')) {
    return ERROR_MESSAGES.INVALID_RATING;
  }
  if (detail.includes('comments') && detail.includes('required')) {
    return ERROR_MESSAGES.COMMENTS_REQUIRED;
  }
  if (detail.includes('comments') && (detail.includes('exceed') || detail.includes('1000'))) {
    return ERROR_MESSAGES.COMMENTS_TOO_LONG;
  }
  if (detail.includes('edit window') && detail.includes('expired')) {
    return ERROR_MESSAGES.EDIT_WINDOW_EXPIRED;
  }
  if (detail.includes('maximum') && detail.includes('edit')) {
    return ERROR_MESSAGES.MAX_EDITS_REACHED;
  }
  if (detail.includes('feedback not found')) {
    return ERROR_MESSAGES.FEEDBACK_NOT_FOUND;
  }

  // Authorization errors
  if (detail.includes('not authorized') || detail.includes('unauthorized')) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }
  if (detail.includes('admin') && (detail.includes('only') || detail.includes('required'))) {
    return ERROR_MESSAGES.ADMIN_ONLY;
  }
  if (detail.includes('forbidden') || detail.includes('access denied')) {
    return ERROR_MESSAGES.FORBIDDEN;
  }
  if (detail.includes('token') || detail.includes('session')) {
    return ERROR_MESSAGES.INVALID_TOKEN;
  }

  // Return original message if no mapping found
  return errorDetail;
};

/**
 * Extracts error message from various error response formats
 * @param {Error|Object} error - Error object from API call
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network errors
  if (!error.response) {
    if (error.message === 'Network Error') {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.code === 'ECONNABORTED') {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Server errors (5xx)
  if (error.response.status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  // Extract error detail from response
  const errorDetail = 
    error.response?.data?.detail || 
    error.response?.data?.message || 
    error.message;

  return mapErrorMessage(errorDetail);
};

/**
 * Validation error messages for form fields
 */
export const VALIDATION_MESSAGES = {
  approvalStatus: {
    required: ERROR_MESSAGES.APPROVAL_STATUS_REQUIRED,
  },
  performanceRating: {
    required: ERROR_MESSAGES.PERFORMANCE_RATING_REQUIRED,
    invalid: ERROR_MESSAGES.PERFORMANCE_RATING_INVALID,
    range: ERROR_MESSAGES.PERFORMANCE_RATING_RANGE,
  },
  comments: {
    required: ERROR_MESSAGES.COMMENTS_EMPTY,
    maxLength: ERROR_MESSAGES.COMMENTS_LENGTH,
  },
  teamMember: {
    required: ERROR_MESSAGES.TEAM_MEMBER_REQUIRED,
  },
};
