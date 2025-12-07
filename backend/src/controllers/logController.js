import Logs from "../models/log.js";

// Get logs related to the current user, with optional filters
export async function getUserLogs(req, res) {
  try {
    const {
      direction = "both", // "to" | "from" | "both"
      projectId,
      taskId,
      priority, // "low" | "medium" | "high"
    } = req.query;

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = {};

    // direction: which side the current user appears in
    if (direction === "to") {
      query.userAssigned = userId;
    } else if (direction === "from") {
      query.userCreated = userId;
    } else {
      // both: either creator or assignee
      query.$or = [{ userCreated: userId }, { userAssigned: userId }];
    }

    if (projectId) {
      query.projectId = projectId;
    }

    if (taskId) {
      query.taskId = taskId;
    }

    if (priority) {
      query.priority = priority;
    }

    const logs = await Logs.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return res.status(500).json({ message: "Failed to fetch user logs" });
  }
}

// Get logs related to a specific project, with optional filters
export async function getProjectLogs(req, res) {
  try {

      /// ADMIN REQUIRED
      if (req.permissionLevel < 2) {
          return res.status(403).json({ message: "Forbidden: Admin access required" })
      }

    const { projectId } = req.params;
    const {
      taskId,
      priority,
      userCreated,
      userAssigned,
    } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const query = { projectId };

    if (taskId) {
      query.taskId = taskId;
    }

    if (priority) {
      query.priority = priority;
    }

    if (userCreated) {
      query.userCreated = userCreated;
    }

    if (userAssigned) {
      query.userAssigned = userAssigned;
    }

    const logs = await Logs.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching project logs:", error);
    return res.status(500).json({ message: "Failed to fetch project logs" });
  }
}