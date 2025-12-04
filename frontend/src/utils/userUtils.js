import { authService } from '../api';

/**
 * Fetches user data for a list of user IDs and creates a lookup map
 * @param {Array<string>} userIds - Array of user IDs to fetch
 * @returns {Promise<Object>} Object mapping userId to user data
 */
export const fetchUsersMap = async (userIds) => {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  try {
    const response = await authService.getUsersByIds(userIds);
    const users = response.data.users || [];
    
    const usersMap = {};
    users.forEach((user) => {
      usersMap[user._id] = user;
    });
    
    return usersMap;
  } catch (err) {
    console.error("Error fetching users:", err);
    return {};
  }
};

/**
 * Gets user name from a users map
 * @param {string} userId - User ID to look up
 * @param {Object} usersMap - Map of userId to user data
 * @param {string} fallback - Fallback text if user not found (default: "Unknown User")
 * @returns {string} User name or fallback text
 */
export const getUserName = (userId, usersMap, fallback = "Unknown User") => {
  if (!userId) return fallback;
  return usersMap[userId]?.name || fallback;
};

/**
 * Gets user email from a users map
 * @param {string} userId - User ID to look up
 * @param {Object} usersMap - Map of userId to user data
 * @param {string} fallback - Fallback text if user not found (default: "")
 * @returns {string} User email or fallback text
 */
export const getUserEmail = (userId, usersMap, fallback = "") => {
  if (!userId) return fallback;
  return usersMap[userId]?.email || fallback;
};

/**
 * Fetches members data for a project and creates a lookup map
 * @param {Object} project - Project object containing ownedBy and members
 * @returns {Promise<Object>} Object with usersMap and ownerData
 */
export const fetchProjectMembers = async (project) => {
  if (!project) {
    return { usersMap: {}, ownerData: null };
  }

  const userIds = new Set();
  
  // Add owner
  if (project.ownedBy) {
    userIds.add(project.ownedBy);
  }
  
  // Add members
  if (project.members && Array.isArray(project.members)) {
    project.members.forEach((member) => {
      if (member.id) {
        userIds.add(member.id);
      }
    });
  }

  const usersMap = await fetchUsersMap(Array.from(userIds));
  const ownerData = project.ownedBy && usersMap[project.ownedBy] 
    ? usersMap[project.ownedBy] 
    : null;

  return { usersMap, ownerData };
};
