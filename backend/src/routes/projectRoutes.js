import express from "express";
import {
  createProject,
  editProject,
  deleteProject,
  updateRole,
  transferOwner,
  invite,
  deleteUser,
  getProject,
  fetchProjects,
  acceptInvite,
  getInvitation,
  fetchInvitations,
  declineInvite,
} from "../controllers/projectController.js";

// middlewares
import authService from "../middlewares/auth.js";
import passCheck from "../middlewares/passwordCheck.js";
import bodyCheck from "../middlewares/bodyCheck.js";
import checkPermission from "../middlewares/projectPermission.js";

const projectRouter = express.Router();

/* ───────────────────────────────
Project Routes
─────────────────────────────── */
// Fetch invitations for the authenticated user
projectRouter.get("/fetch-invites", authService, fetchInvitations);

//  Create a new project
projectRouter.post("/", bodyCheck, authService, createProject);

//  Fetch all projects for the authenticated user
projectRouter.get("/", authService, fetchProjects);

//  Edit a project's name or description
projectRouter.put(
  "/:projectId",
  bodyCheck,
  authService,
  checkPermission,
  editProject
);


//  Delete a project
projectRouter.delete(
  "/:projectId",
  bodyCheck,
  authService,
  checkPermission,
  passCheck,
  deleteProject
);

//  Update a member's role in the project
projectRouter.put(
  "/:projectId/members/:memberId/role",
  authService,
  checkPermission,
  updateRole
);

//  Transfer project ownership
projectRouter.put(
  "/:projectId/transfer-owner",
  authService,
  checkPermission,
  passCheck,
  transferOwner
);

//  Invite a user or email to join project
projectRouter.post("/:projectId/invite", authService, checkPermission, invite);

// route to accept invite
projectRouter.post(
  "/:projectId/invite/:inviteId/:inviteCode",
  authService,
  acceptInvite
);

// route to get invite details
projectRouter.get("/:projectId/invite/:inviteId", authService, getInvitation);

// route to show the logged in user his invitations

// route to handle declining joining a project
projectRouter.post(
  "/:projectId/invite/:inviteId/:inviteCode/decline",
  authService,
  declineInvite
);

// Delete a user from a project
projectRouter.delete(
  "/:projectId/:userId/delete",
  authService,
  checkPermission,
  deleteUser
);


// Fetch project details
projectRouter.get("/:projectId", authService, checkPermission, getProject);
export default projectRouter;
