import apiClient from './apiClient';

const notificationService = {
  /**
   * Get notifications for the current user
   * @param {boolean} unreadOnly - If true, return only unread notifications
   * @param {number} limit - Maximum number of notifications to return
   * @returns {Promise<Array>} List of notifications
   */
  getNotifications: async (unreadOnly = false, limit = 50) => {
    const response = await apiClient.get('/notifications/', {
      params: { unread_only: unreadOnly, limit }
    });
    return response.data;
  },

  /**
   * Get count of unread notifications
   * @returns {Promise<number>} Count of unread notifications
   */
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Response message
   */
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Response with count of notifications marked as read
   */
  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  }
};

export default notificationService;
