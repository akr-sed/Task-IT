import Log from "../models/log.js";
import { emitToUser } from "../config/socket.js";

const removeUndefinedFields = (payload = {}) => {
  const cleanedPayload = { ...payload }; // create a copy
  Object.keys(cleanedPayload).forEach((key) => {
    if (cleanedPayload[key] === undefined || cleanedPayload[key] === null) {
      delete cleanedPayload[key];
    }
  });
  return cleanedPayload;
};

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
    // Task-related notifications - link to specific task when taskId available
    case "TASK_CREATED":
      return `${projectBase}?tab=tasks`;
    case "TASK_ASSIGNED":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}?tab=assignment`;
    case "TASK_STATUS_CHANGED":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}?tab=tasks`;
    case "TASK_EDITED":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}?tab=tasks`;
    case "TASK_COMMENT":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}?tab=tasks`;
    case "TASK_DELETED":
      return `${projectBase}?tab=tasks`;
    
    // Project-related notifications - use correct tab name "members"
    case "PROJECT_INVITE_SENT":
      return `${projectBase}?tab=overview`;
    case "PROJECT_INVITE_ACCEPTED":
    case "PROJECT_INVITE_DECLINED":
    case "PROJECT_MEMBER_REMOVED":
    case "PROJECT_ROLE_UPDATED":
    case "PROJECT_OWNERSHIP_TRANSFERRED":
      return `${projectBase}?tab=members`;
    case "PROJECT_EDITED":
      return `${projectBase}?tab=overview`;
    case "PROJECT_DELETED":
      return "/projects";
    
    default:
      return projectBase;
  }
}

async function createLog({
  title,
  content,
  type = "GENERAL",
  userCreated,
  userAssigned,
  projectId,
  taskId,
  priority = "medium",
  link,
} = {}) {
  if (!title || !content) {
    console.warn("createLog called without mandatory title/content");
    return null;
  }

  // Auto-generate link if not provided
  const notificationLink = link || generateLink(type, projectId, taskId);

  const logPayload = removeUndefinedFields({
    title,
    content,
    type,
    userCreated,
    userAssigned,
    projectId,
    taskId,
    priority,
    link: notificationLink,
  });

  try {
    const log = await Log.create(logPayload);
    
    // Emit real-time notification to the assigned user via Socket.IO
    if (userAssigned && log) {
      const notificationData = {
        _id: log._id,
        title: log.title,
        content: log.content,
        type: log.type,
        priority: log.priority,
        link: log.link,
        projectId: log.projectId,
        taskId: log.taskId,
        isRead: false,
        createdAt: log.createdAt,
      };
      
      emitToUser(userAssigned.toString(), "notification:new", notificationData);
    }
    
    return log;
  } catch (error) {
    console.error("Failed to persist log entry:", error);
    return null;
  }
}

export default createLog;
