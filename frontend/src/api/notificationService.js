import api from './axiosInstance';

/**
 * Notification Service
 * 
 * Centralized API calls for notification-related operations
 * Notifications are based on logs assigned to the current user
 */

const notificationService = {
  /**
   * Get notifications for the authenticated user
   * @param {Object} params - Query parameters
   * @param {boolean} params.unread - Filter by unread status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} Response with notifications array and pagination
   */
  getMyNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.unread !== undefined) {
      queryParams.append('unread', params.unread);
    }
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }

    const response = await api.get(`/notifications/me?${queryParams.toString()}`);
    return response;
  },

  /**
   * Get unread notification count
   * @returns {Promise} Response with unreadCount
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/me/unread-count');
    return response;
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Response with updated notification
   */
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response;
  },

  /**
   * Mark all notifications as read for current user
   * @returns {Promise} Response with success message
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/me/read-all');
    return response;
  },
};

export default notificationService;
