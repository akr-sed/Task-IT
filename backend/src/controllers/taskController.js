import Task from "../models/task.js";
import checkIfUserBelongsToProject from "../utils/projectBelongCheck.js";

// Create new task
export async function createTask(req, res) {
  if (req.permissionLevel < 2) {
    return res
      .status(403)
      .json({ message: "Insufficient permissions to create a task." });
  }
  const {
    projectId,
    activity,
    title,
    description,
    assignedTo,
    status,
    priority,
    dueDate,
  } = req.body;
  if (!projectId || !title) {
    return res
      .status(400)
      .json({ message: "Project ID and Title are required." });
  }

  try {
    const existingTask = await Task.findOne({ projectId, title });
    if (existingTask) {
      return res
        .status(400)
        .json({ message: "Task with this title already exists." });
    }
    if (assignedTo) {
      const isMember = await checkIfUserBelongsToProject({
        projectId,
        userId: assignedTo,
      });
      if (!isMember) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a member of the project." });
      }
    }
    const newTask = new Task({
      projectId,
      activity,
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
    });

    const savedTask = await newTask.save();
    return res
      .status(201)
      .json({ message: "task created successfully", task: savedTask });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating task", error: error.message });
  }
}