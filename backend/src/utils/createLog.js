import Log from "../models/log.js";

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
    // Task-related notifications
    case "TASK_CREATED":
      return `${projectBase}/tasks`;
    case "TASK_ASSIGNED":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}/tasks`;
    case "TASK_STATUS_CHANGED":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}/tasks`;
    case "TASK_EDITED":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}/tasks`;
    case "TASK_DELETED":
      return `${projectBase}/tasks`;
    case "TASK_COMMENT":
      return taskId ? `${projectBase}/tasks/${taskId}` : `${projectBase}/tasks`;
    
    // Project-related notifications  
    case "PROJECT_INVITE_SENT":
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
    return await Log.create(logPayload);
  } catch (error) {
    console.error("Failed to persist log entry:", error);
    return null;
  }
}

export default createLog;
