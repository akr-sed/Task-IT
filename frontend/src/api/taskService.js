import api from './axiosInstance';

/**
 * Task Service
 * 
 * Centralized API calls for task-related operations
 */

const taskService = {
  /**
   * Get all tasks for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} Response with tasks array
   */
  getTasksByProject: async (projectId) => {
    const response = await api.get(`/tasks/${projectId}`);
    return response;
  },

  /**
   * Get all tasks assigned to the authenticated user
   * @returns {Promise} Response with tasks array
   */
  getMyTasks: async () => {
    const response = await api.get('/tasks');
    return response;
  },

  /**
   * Get specific task details
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @returns {Promise} Response with task data
   */
  getTaskById: async (projectId, taskId) => {
    const response = await api.get(`/tasks/${projectId}/${taskId}`);
    return response;
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data including projectId, title, description, etc.
   * @returns {Promise} Response with created task
   */
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response;
  },

  /**
   * Update task details
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} Response with updated task
   */
  updateTask: async (projectId, taskId, taskData) => {
    const response = await api.put(`/tasks/${projectId}/${taskId}`, taskData);
    return response;
  },

  /**
   * Delete a task
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @returns {Promise} Response with success message
   */
  deleteTask: async (projectId, taskId) => {
    const response = await api.delete(`/tasks/${projectId}/${taskId}`);
    return response;
  },

  /**
   * Assign task to a user
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @param {string} assignedTo - User ID to assign task to
   * @returns {Promise} Response with success message
   */
  assignTask: async (projectId, taskId, assignedTo) => {
    const response = await api.put(`/tasks/${projectId}/${taskId}/assign`, {
      assignedTo,
    });
    return response;
  },

  /**
   * Update task status
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @param {string} status - New status ('todo', 'in progress', 'done', 'to review')
   * @returns {Promise} Response with updated task
   */
  updateTaskStatus: async (projectId, taskId, status) => {
    const response = await api.put(`/tasks/${projectId}/${taskId}/status`, {
      status,
    });
    return response;
  },

  /**
   * Add comment to task
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @param {string} text - Comment text
   * @returns {Promise} Response with added comment
   */
  addComment: async (projectId, taskId, text) => {
    const response = await api.post(`/tasks/${projectId}/${taskId}/comment`, {
      text,
    });
    return response;
  },

  /**
   * Get all comments for a task
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @returns {Promise} Response with comments array
   */
  getComments: async (projectId, taskId) => {
    const response = await api.get(`/tasks/${projectId}/${taskId}/comments`);
    return response;
  },

  /**
   * Delete a comment
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @param {string} commentId - Comment ID
   * @returns {Promise} Response with success message
   */
  deleteComment: async (projectId, taskId, commentId) => {
    const response = await api.delete(
      `/tasks/${projectId}/${taskId}/comment/${commentId}`
    );
    return response;
  },
};

export default taskService;

