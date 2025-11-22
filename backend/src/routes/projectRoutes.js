import express from "express";
import {
    createProject,
    editProject,
    deleteProject,
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

//  Create a new project
projectRouter.post("/", bodyCheck, authService, createProject);

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
