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

// Edit task details
export async function editTask(req, res) {
  // todo: edit project info ( display name , description )
  if (req.permissionLevel < 2)
    return res
      .status(400)
      .json({ message: "you do not have permission to edit this task" });

  try {
    const task = req.task;
    const editedTask = req.body;

    if (!editedTask) {
      return res.status(400).json({ message: "No task data provided." });
    }

    // Update task fields with provided values
    // Update fields with new values
    Object.keys(editedTask).forEach((key) => {
      // Skip immutable fields like _id, createdAt, etc.
      if (!["_id", "__v", "createdAt", "updatedAt"].includes(key)) {
        task[key] = editedTask[key];
      }
    });

    const updatedTask = await task.save();

    return res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("error in the edit task controller");
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function fetchTask(req, res) {
  if (req.permissionLevel === 0)
    return res
      .status(400)
      .json({ message: "you are not a member of this project" });

  try {
    const currentTask = req.task;
    return res.status(200).json(currentTask);
  } catch (error) {
    console.error("error in the fetch task controller", error);
    return res.status(500).json({ message: "internal server error" });
  }
}
