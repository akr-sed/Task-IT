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

async function createLog({
  title,
  content,
  userCreated,
  userAssigned,
  projectId,
  taskId,
} = {}) {
  if (!title || !content) {
    console.warn("createLog called without mandatory title/content");
    return null;
  }

  const logPayload = removeUndefinedFields({
    title,
    content,
    userCreated,
    userAssigned,
    projectId,
    taskId,
  });

  try {
    return await Log.create(logPayload); // create the log
  } catch (error) {
    console.error("Failed to persist log entry:", error);
    return null;
  }
}

export default createLog;

