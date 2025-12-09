import express from "express";
import auth from "../middlewares/auth.js";
import checkPermission from "../middlewares/projectPermission.js";
import { getUserLogs, getProjectLogs } from "../controllers/logController.js";

const router = express.Router();

// Get logs of the authenticated user (with optional filters via query)
router.get("/me", auth, getUserLogs);

// Get logs of a specific project (admin/owner only, projectPermission sets req.permissionLevel)
router.get(
  "/project/:projectId",
  auth,
  checkPermission,
  getProjectLogs
);

export default router;

