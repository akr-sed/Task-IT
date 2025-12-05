import Task from "../models/task.js";

// this middleware checks if the task belongs to the project or not
export default async function taskCheck(req, res, next) {
  try {
    // remember the project to not fetch for it each time we will pass it directly since all the routes of the project will use it.

    const { taskId, projectId } = req.params;

    // verify the task belongs to this project before deleting
    const task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
      return res
        .status(404)
        .json({
          message: "Task not found or does not belong to this project.",
        });
    }

    req.task = task;

    next();
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Server error while checking if task belongs to this project.",
      });
  }
}
