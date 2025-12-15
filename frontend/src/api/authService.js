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
   * @param {string} email - User email address
   * @returns {Promise} Response with success message
   */
  resendVerificationCode: async (email) => {
    const response = await api.post('/auth/verify-email/resend-verification-code', {
      email,
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

  /**
   * Update user profile (name)
   * @param {Object} profileData - { name }
   * @returns {Promise} Response with updated user data
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Change password
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise} Response with success message
   */
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  /**
   * Request email change (sends verification code to new email)
   * @param {string} newEmail - New email address
   * @returns {Promise} Response with success message
   */
  requestEmailChange: async (newEmail) => {
    const response = await api.post('/auth/email/request-change', { newEmail });
    return response.data;
  },

  /**
   * Verify email change with code
   * @param {Object} verificationData - { verificationCode, newEmail }
   * @returns {Promise} Response with updated user data
   */
  verifyEmailChange: async (verificationData) => {
    const response = await api.post('/auth/email/verify-change', verificationData);
    return response.data;
  },

  /**
   * Request account deletion (sends verification code)
   * @returns {Promise} Response with success message
   */
  requestAccountDeletion: async () => {
    const response = await api.post('/auth/account/request-deletion');
    return response.data;
  },

  /**
   * Verify and delete account permanently
   * @param {number} verificationCode - 6-digit verification code
   * @returns {Promise} Response with success message
   */
  verifyAndDeleteAccount: async (verificationCode) => {
    const response = await api.post('/auth/account/verify-deletion', { verificationCode });
    return response.data;
  },
};

export default authService;