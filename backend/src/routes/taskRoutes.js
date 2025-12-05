import express from "express";

import {
  createTask,
  editTask,
  deleteTask,
  assignTask,
  listTasksOfProject,
  fetchTask,
  listTasks,
  updateTaskStatus,
  comment,
  deleteComment,
  getComments
} from "../controllers/taskController.js";

// middlewares
import authService from "../middlewares/auth.js";
import passCheck from "../middlewares/passwordCheck.js";
import bodyCheck from "../middlewares/bodyCheck.js";
import permissionCheck from "../middlewares/projectPermission.js";
import taskCheck from "../middlewares/projectTask.js"; // check if task belongs to the project
const taskRouter = express.Router();

/* ───────────────────────────────
   Task Routes
─────────────────────────────── */

//  Create a new task
taskRouter.post("/", bodyCheck, authService, permissionCheck, createTask);

//  List all tasks in a project
taskRouter.get("/:projectId", authService, listTasksOfProject);

//  Edit a task's information
taskRouter.put(
  "/:projectId/:taskId",
  bodyCheck,
  authService,
  permissionCheck,
  taskCheck,
  editTask
);

//  Fetch a specific task
taskRouter.get(
  "/:projectId/:taskId",
  bodyCheck,
  authService,
  permissionCheck,
  taskCheck,
  fetchTask
);

//  Delete a task
taskRouter.delete(
  "/:projectId/:taskId",
  bodyCheck,
  authService,
  // ,passCheck
  permissionCheck,
  taskCheck,
  deleteTask
);

//  Assign a task to a user
taskRouter.put(
  "/:projectId/:taskId/assign",
  bodyCheck,
  authService,
  // passCheck,
  permissionCheck,
  taskCheck,
  assignTask
);

//  Update task status
taskRouter.put(
  "/:projectId/:taskId/status",
  bodyCheck,
  authService,
  // passCheck,
  permissionCheck,
  taskCheck,
  updateTaskStatus
);

//  List all tasks assigned to the authenticated user
taskRouter.get("/", authService, listTasks);

// add comment to task
taskRouter.post("/:projectId/:taskId/comment", bodyCheck, authService, permissionCheck, taskCheck, comment);

// delete comment from task
taskRouter.delete("/:projectId/:taskId/comment/:commentId", authService, permissionCheck, taskCheck, deleteComment);

// get comments for a task
taskRouter.get("/:projectId/:taskId/comments", authService, permissionCheck, taskCheck, getComments);

export default taskRouter;
