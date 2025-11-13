/**
 * Retry helper utility for handling failed API requests
 * Implements exponential backoff strategy
 */

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @param {Function} onRetry - Callback function called on each retry attempt
 * @returns {Promise} Result of the function or throws error after max retries
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  onRetry = null
) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Try to execute the function
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (shouldNotRetry(error)) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      
      // Call the retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay);
      }
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Determines if an error should not be retried
 * @param {Error} error - Error object
 * @returns {boolean} True if should not retry
 */
const shouldNotRetry = (error) => {
  // Don't retry on client errors (4xx) except for specific cases
  if (error.response) {
    const status = error.response.status;
    
    // Don't retry on authentication/authorization errors
    if (status === 401 || status === 403) {
      return true;
    }
    
    // Don't retry on validation errors
    if (status === 400 || status === 422) {
      return true;
    }
    
    // Don't retry on not found errors
    if (status === 404) {
      return true;
    }
    
    // Don't retry on conflict errors
    if (status === 409) {
      return true;
    }
    
    // Retry on server errors (5xx) and timeout errors
    if (status >= 500 || status === 408) {
      return false;
    }
  }
  
  // Retry on network errors
  if (!error.response && error.message === 'Network Error') {
    return false;
  }
  
  // Retry on timeout errors
  if (error.code === 'ECONNABORTED') {
    return false;
  }
  
  // Don't retry by default
  return true;
};

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Hook-like wrapper for retry logic with state management
 * Returns a function that can be used to execute retryable operations
 */
export class RetryManager {
  constructor() {
    this.isRetrying = false;
    this.currentAttempt = 0;
    this.maxRetries = 3;
  }
  
  /**
   * Execute a function with retry logic
   * @param {Function} fn - Async function to execute
   * @param {Object} options - Options object
   * @param {number} options.maxRetries - Maximum retry attempts
   * @param {Function} options.onRetry - Callback on retry
   * @param {Function} options.onSuccess - Callback on success
   * @param {Function} options.onError - Callback on final error
   * @returns {Promise} Result of the function
   */
  async execute(fn, options = {}) {
    const {
      maxRetries = 3,
      onRetry = null,
      onSuccess = null,
      onError = null
    } = options;
    
    this.maxRetries = maxRetries;
    this.isRetrying = false;
    this.currentAttempt = 0;
    
    try {
      const result = await retryWithBackoff(
        fn,
        maxRetries,
        1000,
        (attempt, max, delay) => {
          this.isRetrying = true;
          this.currentAttempt = attempt;
          if (onRetry) {
            onRetry(attempt, max, delay);
          }
        }
      );
      
      this.isRetrying = false;
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      this.isRetrying = false;
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }
  
  /**
   * Get current retry state
   * @returns {Object} State object with isRetrying and currentAttempt
   */
  getState() {
    return {
      isRetrying: this.isRetrying,
      currentAttempt: this.currentAttempt,
      maxRetries: this.maxRetries
    };
  }
}
