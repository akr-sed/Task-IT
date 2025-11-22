import Project from "../models/project.js";
import User from "../models/user.js";

import dotenv from "dotenv";
dotenv.config();

/** PLEASE REVIEW PROJECT ROUTES BEFORE IMPLEMENTING THIS FILE */

/* ──────────────────────────────────────────────
   Controller Functions
────────────────────────────────────────────── */
// Create new project
export async function createProject(req, res) {
    // todo: create a project POST method ( all params are inside body )
}

// Edit project details
export async function editProject(req, res) {
    // todo: edit project info ( display name , description )
    // only admin can edit
}

// Delete project
export async function deleteProject(req, res) {
    // todo: delete the project ( must verify password through a middleware )
}


/* ──────────────────────────────────────────────
   Export as grouped object
────────────────────────────────────────────── */
export default {
    createProject,
    editProject,
    deleteProject,
};
