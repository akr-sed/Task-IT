import createLog from "./createLog.js";

/**
 * Generate navigation link based on notification type
 * @param {string} type - Notification type
 * @param {string} projectId - Project ID
 * @param {string} taskId - Task ID (optional)
 * @returns {string} Navigation link
 */
function generateLink(type, projectId, taskId) {
  if (!projectId) return null;
  
  const projectBase = `/projects/${projectId}`;
  
  switch (type) {
    case "TASK_CREATED":
      return `${projectBase}/tasks`;
    case "TASK_ASSIGNED":
    case "TASK_STATUS_CHANGED":
    case "TASK_EDITED":
    case "TASK_COMMENT":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}/tasks`;
    case "TASK_DELETED":
      return `${projectBase}/tasks`;
    case "PROJECT_INVITE_ACCEPTED":
    case "PROJECT_INVITE_DECLINED":
    case "PROJECT_MEMBER_REMOVED":
    case "PROJECT_ROLE_UPDATED":
    case "PROJECT_OWNERSHIP_TRANSFERRED":
    case "PROJECT_EDITED":
      return projectBase;
    case "PROJECT_DELETED":
      return "/projects";
    default:
      return projectBase;
  }
}

/**
 * Create a notification for specified recipients
 * Each recipient gets their own log entry so read status is individual
 * 
 * @param {Object} params
 * @param {string} params.projectId - Project ID
 * @param {string} params.taskId - Task ID (optional)
 * @param {string} params.userCreated - User who triggered the event
 * @param {Array} params.recipients - Array of user IDs to notify
 * @param {string} params.title - Notification title
 * @param {string} params.content - Notification content
 * @param {string} params.type - Notification type (from enum)
 * @param {string} params.priority - Priority level (low, medium, high)
 * @param {string} params.excludeUserId - User ID to exclude (usually the creator)
 * @param {string} params.link - Custom link (auto-generated if not provided)
 */
async function createProjectNotification({
  projectId,
  taskId,
  userCreated,
  recipients = [],
  // Legacy support: also accept projectMembers
  projectMembers,
  title,
  content,
  type = "GENERAL",
  priority = "medium",
  excludeUserId = null,
  link = null,
} = {}) {
  try {
    // Support both recipients and legacy projectMembers parameter
    const memberList = recipients.length > 0 ? recipients : (projectMembers || []);
    
    // Filter out the user who created the event (no need to notify themselves)
    const usersToNotify = memberList.filter(
      (userId) => userId.toString() !== (excludeUserId?.toString() || userCreated?.toString())
    );

    if (usersToNotify.length === 0) {
      console.log(`[createProjectNotification] No users to notify after filtering`);
      return [];
    }

    // Auto-generate link if not provided
    const notificationLink = link || generateLink(type, projectId, taskId);

    console.log(`[createProjectNotification] Creating ${usersToNotify.length} notifications`);
    console.log(`[createProjectNotification] Type: ${type}`);
    console.log(`[createProjectNotification] Title: ${title}`);
    console.log(`[createProjectNotification] Link: ${notificationLink}`);

    // Create a separate log for each recipient
    const notificationPromises = usersToNotify.map((userId) =>
      createLog({
        title,
        content,
        type,
        userCreated,
        userAssigned: userId,
        projectId,
        taskId,
        priority,
        link: notificationLink,
      })
    );

    const results = await Promise.all(notificationPromises);
    console.log(`[createProjectNotification] Successfully created ${results.filter(Boolean).length} notifications`);
    return results.filter(Boolean);
  } catch (error) {
    console.error("[createProjectNotification] Error:", error);
    return [];
  }
}

/**
 * Create notification for project admins only
 * @param {Object} project - Project document with members array
 * @param {Object} notificationData - Notification data
 */
export async function notifyProjectAdmins({
  project,
  projectId,
  taskId,
  userCreated,
  title,
  content,
  type = "GENERAL",
  priority = "medium",
  includeOwner = true,
  excludeUserId = null,
} = {}) {
  const adminIds = [];
  
  // Add owner if requested
  if (includeOwner && project?.ownedBy) {
    adminIds.push(project.ownedBy.toString());
  }
  
  // Add admin members
  if (project?.members) {
    project.members.forEach((member) => {
      if (member.role === "admin" && member.id) {
        adminIds.push(member.id.toString());
      }
    });
  }
  
  // Remove duplicates
  const uniqueAdmins = [...new Set(adminIds)];
  
  return createProjectNotification({
    projectId: projectId || project?._id,
    taskId,
    userCreated,
    recipients: uniqueAdmins,
    title,
    content,
    type,
    priority,
    excludeUserId,
  });
}

/**
 * Create notification for all project members
 * @param {Object} project - Project document
 * @param {Object} notificationData - Notification data  
 */
export async function notifyAllProjectMembers({
  project,
  projectId,
  taskId,
  userCreated,
  title,
  content,
  type = "GENERAL",
  priority = "medium",
  includeOwner = true,
  excludeUserId = null,
} = {}) {
  const memberIds = [];
  
  // Add owner if requested
  if (includeOwner && project?.ownedBy) {
    memberIds.push(project.ownedBy.toString());
  }
  
  // Add all members
  if (project?.members) {
    project.members.forEach((member) => {
      if (member.id) {
        memberIds.push(member.id.toString());
      }
    });
  }
  
  // Remove duplicates
  const uniqueMembers = [...new Set(memberIds)];
  
  return createProjectNotification({
    projectId: projectId || project?._id,
    taskId,
    userCreated,
    recipients: uniqueMembers,
    title,
    content,
    type,
    priority,
    excludeUserId,
  });
}

/**
 * Create notification for specific user(s)
 * @param {Array|string} userIds - User ID(s) to notify
 * @param {Object} notificationData - Notification data
 */
export async function notifyUsers({
  userIds,
  projectId,
  taskId,
  userCreated,
  title,
  content,
  type = "GENERAL",
  priority = "medium",
  excludeUserId = null,
} = {}) {
  const recipients = Array.isArray(userIds) ? userIds : [userIds];
  
  return createProjectNotification({
    projectId,
    taskId,
    userCreated,
    recipients,
    title,
    content,
    type,
    priority,
    excludeUserId,
  });
}

export default createProjectNotification;
