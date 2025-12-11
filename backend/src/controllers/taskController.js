/** PLEASE REVIEW TASK ROUTES BEFORE IMPLEMENTING THIS FILE */

/* ──────────────────────────────────────────────
   Controller Functions
────────────────────────────────────────────── */
import Task from "../models/task.js";
import User from "../models/user.js";
import checkIfUserBelongsToProject from "../utils/projectBelongCheck.js";
import createLog from "../utils/createLog.js";
import createProjectNotification, { 
  notifyProjectAdmins, 
  notifyAllProjectMembers,
  notifyUsers 
} from "../utils/createProjectNotification.js";
import Project from "../models/project.js";

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

    // Get project for notification targeting
    const project = await Project.findById(projectId);
    
    // Get the name of the user who created the task
    const creator = await User.findById(req.userId);
    const creatorName = creator?.name || "Someone";

    // Notify project admins and owner about new task
    await notifyProjectAdmins({
      project,
      projectId,
      taskId: savedTask._id,
      userCreated: req.userId,
      title: "New Task Created",
      content: `${creatorName} created task "${title}" in ${project?.displayName || project?.name || "the project"}`,
      type: "TASK_CREATED",
      priority: "medium",
      includeOwner: true,
      excludeUserId: req.userId,
    });

    // If task is assigned to someone, notify them separately
    if (assignedTo && assignedTo.toString() !== req.userId.toString()) {
      await notifyUsers({
        userIds: [assignedTo],
        projectId,
        taskId: savedTask._id,
        userCreated: req.userId,
        title: "Task Assigned to You",
        content: `${creatorName} created and assigned you to task "${title}"`,
        type: "TASK_ASSIGNED",
        priority: "high",
        excludeUserId: req.userId,
      });
    }

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

    const oldDueDate = task.dueDate;

    // Update task fields with provided values
    // Update fields with new values
    Object.keys(editedTask).forEach((key) => {
      // Skip immutable fields like _id, createdAt, etc.
      if (!["_id", "__v", "createdAt", "updatedAt"].includes(key)) {
        task[key] = editedTask[key];
      }
    });

    const updatedTask = await task.save();

    // Get project and editor info for notifications
    const project = await Project.findById(updatedTask.projectId);
    const editor = await User.findById(req.userId);
    const editorName = editor?.name || "Someone";

    // 1. Notify for general assignment updates (existing logic)
    // Only notify if there's an assigned user (who isn't the editor) and it wasn't a due date change (to avoid double notif if we want to separate them, but here we keep them independent)
    // Actually, let's keep the existing check but maybe perform it separately?
    // The existing logic sends "Task Updated".
    
    // 2. Check for Due Date Change
    const newDueDate = updatedTask.dueDate;
    const oldDateStr = oldDueDate ? new Date(oldDueDate).toISOString().split('T')[0] : null;
    const newDateStr = newDueDate ? new Date(newDueDate).toISOString().split('T')[0] : null;

    if (newDateStr !== oldDateStr && newDateStr) { // If date changed (and is not null)
         const notificationTitle = oldDateStr ? "Task Due Date Updated" : "Task Due Date Added";
         const formattedDate = new Date(newDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         const content = `${editorName} ${oldDateStr ? 'updated' : 'set'} due date for "${updatedTask.title}" to ${formattedDate}`;
         
         // Notify Assignee (if not editor)
         if (updatedTask.assignedTo && updatedTask.assignedTo.toString() !== req.userId) {
             await notifyUsers({
                 userIds: [updatedTask.assignedTo],
                 projectId: updatedTask.projectId,
                 taskId: updatedTask._id,
                 userCreated: req.userId,
                 title: notificationTitle,
                 content: content,
                 type: "TASK_EDITED",
                 priority: "high",
                 excludeUserId: req.userId
             });
         }

         // Notify Admins (if not editor)
         await notifyProjectAdmins({
             project,
             projectId: updatedTask.projectId,
             taskId: updatedTask._id,
             userCreated: req.userId,
             title: notificationTitle,
             content: content,
             type: "TASK_EDITED",
             priority: "medium",
             includeOwner: true,
             excludeUserId: req.userId
         });

    } else if (updatedTask.assignedTo && updatedTask.assignedTo.toString() !== req.userId.toString()) {
      // Logic for generic edit (e.g. description change) - fallback if NOT a due date change? 
      // Or we can allow both. The existing code sent "Task Updated". 
      // If we just changed Due Date, we sent the specific one above. 
      // If we changed OTHER things, we might want this one.
      // To prevent duplicate spam if only Due Date changed, we can check if that was the only major change?
      // For simplicity, let's leave this as is, but maybe wrap it in an else or check if we didn't just send a notif.
      // But user might change Description AND Due Date.
      
      // Let's keep it simple: If Due Date changed, we sent a Specific Notification. 
      // If NOT, we send the Generic one.
      
      await notifyUsers({
        userIds: [updatedTask.assignedTo],
        projectId: updatedTask.projectId,
        taskId: updatedTask._id,
        userCreated: req.userId,
        title: "Task Updated",
        content: `${editorName} updated task "${updatedTask.title}" assigned to you`,
        type: "TASK_EDITED",
        priority: "low",
        excludeUserId: req.userId,
      });
    }

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

    // Get project and deleter info
    const project = await Project.findById(task.projectId);
    const deleter = await User.findById(req.userId);
    const deleterName = deleter?.name || "Someone";

    // Notify the assigned user if the task was assigned (and it's not the deleter)
    if (task.assignedTo && task.assignedTo.toString() !== req.userId.toString()) {
      await notifyUsers({
        userIds: [task.assignedTo],
        projectId: task.projectId,
        taskId: task._id,
        userCreated: req.userId,
        title: "Task Deleted",
        content: `${deleterName} deleted task "${task.title}" that was assigned to you`,
        type: "TASK_DELETED",
        priority: "high",
        excludeUserId: req.userId,
      });
    }

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

    // Get assigner info
    const project = await Project.findById(task.projectId);
    const assigner = await User.findById(req.userId);
    const assignerName = assigner?.name || "Someone";
    const assignee = await User.findById(assignedTo);
    const assigneeName = assignee?.name || "a team member";

    // Notify the assigned user
    if (assignedTo.toString() !== req.userId.toString()) {
      await notifyUsers({
        userIds: [assignedTo],
        projectId: task.projectId,
        taskId: task._id,
        userCreated: req.userId,
        title: "Task Assigned to You",
        content: `${assignerName} assigned you to task "${task.title}"`,
        type: "TASK_ASSIGNED",
        priority: "high",
        excludeUserId: req.userId,
      });
    }

    // Notify project admins ONLY if assignee is not already an admin (avoid duplicate notifications)
    const assigneeIsAdmin = assignedTo && project.members?.some(
      m => m.id?.toString() === assignedTo.toString() && m.role === "admin"
    );
    const isAssigneeOwner = assignedTo && project.ownedBy?.toString() === assignedTo.toString();

    // Only notify admins if the assignee is not an admin/owner (they already got the direct notification)
    if (!assigneeIsAdmin && !isAssigneeOwner) {
      await notifyProjectAdmins({
        project,
        projectId: task.projectId,
        taskId: task._id,
        userCreated: req.userId,
        title: "Task Assignment Updated",
        content: `${assignerName} assigned "${task.title}" to ${assigneeName}`,
        type: "TASK_ASSIGNED",
        priority: "low",
        includeOwner: true,
        excludeUserId: req.userId,
      });
    }

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

    // Get project and user info for notifications
    const project = await Project.findById(updatedTask.projectId);
    const updater = await User.findById(req.userId);
    const updaterName = updater?.name || "Someone";

    // Format status for display (handle multi-word statuses like "in progress")
    const statusDisplay = status
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Notify all project members about status change (it's important for everyone to see progress)
    await notifyAllProjectMembers({
      project,
      projectId: updatedTask.projectId,
      taskId: updatedTask._id,
      userCreated: req.userId,
      title: `Task Status: ${statusDisplay}`,
      content: `${updaterName} changed "${updatedTask.title}" status to "${statusDisplay}"`,
      type: "TASK_STATUS_CHANGED",
      priority: status === "done" ? "medium" : "low",
      includeOwner: true,
      excludeUserId: req.userId,
    });

    return res
      .status(200)
      .json({ message: "Task status updated successfully", task: updatedTask });
  } catch (error) {
    console.error("error in the update task status controller", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

// list project tasks
export async function listTasksOfProject(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const belongs = await checkIfUserBelongsToProject({
      projectId: projectId,
      userId: userId,
    });

    if (!belongs)
      return res
        .status(403)
        .json({ message: "you are not a member of this project" });
    
    // Optimize query with index hint, field projection (including comments), sorting, and lean()
    const tasks = await Task.find({ projectId: projectId })
      .hint('task_project_status_idx') // Use compound index for faster lookup
      .select('title description status priority dueDate assignedTo projectId comments createdAt updatedAt')
      .sort({ createdAt: -1 }) // Newest first
      .lean() // Returns plain JS objects (faster, no Mongoose overhead)
      .exec(); // Explicit execution
    
    return res.status(200).json({ tasks: tasks });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
}

// list user tasks
export async function listTasks(req, res) {
  try {
    const userId = req.userId;
    // Optimize query with correct index, field projection, and lean()
    const tasks = await Task.find({ assignedTo: userId })
      .hint('task_assignee_idx') // Use single-field index for faster lookup
      .select('title description status priority dueDate assignedTo projectId createdAt updatedAt')
      .lean() // Returns plain JS objects (faster, no Mongoose overhead)
      .exec(); // Explicit execution
    
    return res.status(200).json({ tasks: tasks });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
}

// comment
export async function comment(req, res) {
    // Check membership first
    if (req.permissionLevel === 0)
        return res
            .status(403)
            .json({ message: "You are not a member of this project" });

    try {
        const userId = req.userId; // from middleware
        const task = req.task; // from middleware
        const { text } = req.body;

        // Validate input
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment text is required" });
        }

        // Create comment
        const newComment = {
            authorId: userId,
            text: text.trim(),
        };

        // Add comment to task
        task.comments.push(newComment);

        // Save changes
        await task.save();

        // Return the newly added comment (last in array)
        const addedComment = task.comments[task.comments.length - 1];

        // Get commenter info
        const project = await Project.findById(task.projectId);
        const commenter = await User.findById(userId);
        const commenterName = commenter?.name || "Someone";

        // Build list of users to notify about the comment
        const usersToNotify = [];
        
        // Add task assignee if not the commenter
        if (task.assignedTo && task.assignedTo.toString() !== userId.toString()) {
          usersToNotify.push(task.assignedTo.toString());
        }
        
        // Notify those users about the comment
        if (usersToNotify.length > 0) {
          await notifyUsers({
            userIds: usersToNotify,
            projectId: task.projectId,
            taskId: task._id,
            userCreated: userId,
            title: "New Comment on Your Task",
            content: `${commenterName} commented on "${task.title}": "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
            type: "TASK_COMMENT",
            priority: "medium",
            excludeUserId: userId,
          });
        }

        return res.status(201).json({
            message: "Comment added successfully",
            comment: addedComment,
        });

    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error writing a comment", error: error.message });
    }
}


// delete comment
export async function deleteComment(req, res) {
    // Check membership first
    if (req.permissionLevel === 0)
        return res
            .status(403)
            .json({ message: "You are not a member of this project" });

    try {
        const userId = req.userId; // from middleware
        const task = req.task; // from middleware
        const { commentId } = req.params; // assuming route: /tasks/:taskId/comments/:commentId

        // Find comment by id
        const comment = task.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check permission: only author or manager/admin can delete
        if (comment.authorId.toString() !== userId && req.permissionLevel < 2) {
            return res
                .status(403)
                .json({ message: "You do not have permission to delete this comment" });
        }

        // Remove comment
        comment.deleteOne();

        // Save task
        await task.save();

        return res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error deleting comment", error: error.message });
    }
}

export async function getComments(req, res) {
    // Check membership first
    if (req.permissionLevel === 0)
        return res
            .status(403)
            .json({ message: "You are not a member of this project" });

    try {
        const task = req.task; // from middleware

        return res.status(200).json({ comments: task.comments });

    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching comments", error: error.message });
    }
}

/* ──────────────────────────────────────────────
   Export as grouped object
────────────────────────────────────────────── */
export default {
  createTask,
  editTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
  listTasksOfProject,
  listTasks,
    comment,
    deleteComment
};
