import api from './axiosInstance';

/**
 * Authentication Service
 * 
 * Centralized API calls for authentication-related operations
 */

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise} Response with tempUser data
   */
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  /**
   * Verify email with code
   * @param {Object} verificationData - { tempUserId, verificationCode }
   * @returns {Promise} Response with user and token
   */
  verifyEmail: async (verificationData) => {
    const response = await api.post('/auth/verify-email', verificationData);
    return response.data;
  },

  /**
   * Resend verification code
   * @param {string} tempUserId - Temporary user ID
   * @returns {Promise} Response with success message
   */
  resendVerificationCode: async (tempUserId) => {
    const response = await api.post('/auth/verify-email/resend-verification-code', {
      tempUserId,
    });
    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with user and token
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Response with success message
   */
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },

  /**
   * Verify password reset code
   * @param {Object} resetData - { email, resetCode }
   * @returns {Promise} Response with userId and resetToken
   */
  verifyResetCode: async (resetData) => {
    const response = await api.post('/auth/reset-password/verify', resetData);
    return response.data;
  },

  /**
   * Set new password
   * @param {Object} passwordData - { userId, resetToken, newPassword }
   * @returns {Promise} Response with user and token
   */
  setNewPassword: async (passwordData) => {
    const response = await api.post('/auth/reset-password/new', passwordData);
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: async (userId) => {
    const response = await api.get(`/auth/${userId}`);
    return response;
  },

  /**
   * Get multiple users by IDs (batch request)
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise} Response with users array
   */
  getUsersByIds: async (userIds) => {
    const response = await api.post('/auth/batch', { userIds });
    return response;
  },

  /**
   * Logout user
   * @returns {Promise} Response from logout endpoint
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },
};

export default authService

