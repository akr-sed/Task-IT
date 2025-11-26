import api from './axiosInstance';

/**
 * Project Service
 * 
 * Centralized API calls for project-related operations
 */

const projectService = {
  /**
   * Get all projects for the authenticated user
   * @returns {Promise} Response with projects array
   */
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response;
  },

  /**
   * Get project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise} Response with project data
   */
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response;
  },

  /**
   * Create a new project
   * @param {Object} projectData - { name, displayName, description }
   * @returns {Promise} Response with created project
   */
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response;
  },

  /**
   * Update project details
   * @param {string} projectId - Project ID
   * @param {Object} projectData - { name, displayName, description }
   * @returns {Promise} Response with updated project
   */
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response;
  },

  /**
   * Delete a project
   * @param {string} projectId - Project ID
   * @param {string} password - User password for confirmation
   * @returns {Promise} Response with success message
   */
  deleteProject: async (projectId, password) => {
    const response = await api.delete(`/projects/${projectId}`, {
      data: { password },
    });
    return response;
  },

  /**
   * Invite user to project
   * @param {string} projectId - Project ID
   * @param {string} email - User email to invite
   * @returns {Promise} Response with success message
   */
  inviteUser: async (projectId, email) => {
    const response = await api.post(`/projects/${projectId}/invite`, { email });
    return response;
  },

  /**
   * Get invitation details
   * @param {string} projectId - Project ID
   * @param {string} inviteId - Invitation ID
   * @returns {Promise} Response with invitation data
   */
  getInvitation: async (projectId, inviteId) => {
    const response = await api.get(`/projects/${projectId}/invite/${inviteId}`);
    return response;
  },

  /**
   * Accept project invitation
   * @param {string} projectId - Project ID
   * @param {string} inviteId - Invitation ID
   * @param {string} inviteCode - Invitation code
   * @returns {Promise} Response with success message and project
   */
  acceptInvitation: async (projectId, inviteId, inviteCode) => {
    const response = await api.post(
      `/projects/${projectId}/invite/${inviteId}/${inviteCode}`
    );
    return response;
  },

  /**
   * Decline project invitation
   * @param {string} projectId - Project ID
   * @param {string} inviteId - Invitation ID
   * @param {string} inviteCode - Invitation code
   * @returns {Promise} Response with success message
   */
  declineInvitation: async (projectId, inviteId, inviteCode) => {
    const response = await api.post(
      `/projects/${projectId}/invite/${inviteId}/${inviteCode}/decline`
    );
    return response;
  },

  /**
   * Get all invitations for the authenticated user
   * @returns {Promise} Response with invitations array
   */
  getMyInvitations: async () => {
    const response = await api.get('/projects/fetch-invites');
    return response;
  },

  /**
   * Update member role in project
   * @param {string} projectId - Project ID
   * @param {string} memberId - Member ID
   * @param {string} role - New role ('admin' or 'member')
   * @returns {Promise} Response with updated project
   */
  updateMemberRole: async (projectId, memberId, role) => {
    const response = await api.put(
      `/projects/${projectId}/members/${memberId}/role`,
      { role }
    );
    return response;
  },

  /**
   * Remove member from project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID to remove
   * @returns {Promise} Response with success message
   */
  removeMember: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/${userId}/delete`);
    return response;
  },

  /**
   * Transfer project ownership
   * @param {string} projectId - Project ID
   * @param {string} newOwnerId - New owner's user ID
   * @param {string} password - Current owner's password
   * @returns {Promise} Response with updated project
   */
  transferOwnership: async (projectId, newOwnerId, password) => {
    const response = await api.put(`/projects/${projectId}/transfer-owner`, {
      newOwnerId,
      password,
    });
    return response;
  },
};

export default projectService;

