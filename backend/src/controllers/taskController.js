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

// Delete task
export async function deleteTask(req, res) {
  if (req.permissionLevel < 2) {
    return res
      .status(403)
      .json({ message: "Insufficient permissions to delete a task." });
  }

  try {
    // fetch task from request
    const task = req.task;

    // no need for additional check since the middleware already did it

    await Task.findByIdAndDelete(task._id);

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error in the deleteTask controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function assignTask(req, res) {
  if (req.permissionLevel < 2) {
    return res
      .status(403)
      .json({ message: "Insufficient permissions to assign a task." });
  }

  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res
        .status(400)
        .json({ message: "Assigned member ID is required." });
    }

    const task = req.task;
    // no need for additional check since the middleware already did it

    // Verify assigned user belongs to the project
    const belongs = await checkIfUserBelongsToProject({
      project: req.project,
      userId: assignedTo,
    });

    if (!belongs) {
      return res.status(403).json({
        message: "Assigned user does not belong to this project.",
      });
    }

    // Assign new member
    task.assignedTo = assignedTo;
    await task.save();

    return res
      .status(200)
      .json({ message: "Task assignment updated successfully." });
  } catch (error) {
    console.error("Error in assignTask controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// Update task status
export async function updateTaskStatus(req, res) {
  // Check membership first
  if (req.permissionLevel === 0)
    return res
      .status(403)
      .json({ message: "you are not a member of this project" });

  try {
    const { status } = req.body;

    if (typeof status === "undefined") {
      return res.status(400).json({ message: "New status is required." });
    }

    const task = req.task;

    const currentUserId = req.userId?.toString();

    const isAssignedMember =
      currentUserId &&
      task.assignedTo &&
      task.assignedTo.toString() === currentUserId;
    const isAdminOrOwner = req.permissionLevel >= 2;

    if (!isAssignedMember && !isAdminOrOwner) {
      return res.status(403).json({
        message: "you do not have permission to update this task status",
      });
    }

    task.status = status;
    const updatedTask = await task.save();

    return res
      .status(200)
      .json({ message: "Task status updated successfully", task: updatedTask });
  } catch (error) {
    console.error("error in the update task status controller", error);
    return res.status(500).json({ message: "internal server error" });
  }
}