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
    try {
        const { name, displayName, description } = req.body;
        if (!name) {
            return res.status(400).json({
                error: "Project name is required",
            });
        }
        // check if project name already exists
        const existingProject = await Project.findOne({ name });
        if (existingProject) {
            return res.status(400).json({ error: "Project name already exists" });
        }

        const newProject = new Project({
            ownedBy: req.userId,
            createdBy: req.userId,
            name,
            displayName,
            description,
        });

        await newProject.save();
        res
            .status(201)
            .json({ message: "Project created successfully", project: newProject });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Edit project details
export async function editProject(req, res) {
    // only admin can edit
    if (req.permissionLevel < 2)
        return res
            .status(403)
            .json({ message: "You do not have permission to edit this project" });
    const { name, displayName, description } = req.body;
    const project = req.project; // Retrieved from permission middleware

    if (!name && !displayName && !description) {
        return res.status(400).json({ error: "Nothing to update" });
    }
    const existingProject = await Project.findOne({ name });
    if (
        existingProject &&
        existingProject._id.toString() !== project._id.toString()
    )
        return res.status(400).json({ error: "Project name already exists" });

    // Update fields if provided
    if (name) project.name = name;
    if (displayName) project.displayName = displayName;
    if (description) project.description = description;

    await project.save();
    res.status(200).json({ message: "Project updated successfully", project });
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
