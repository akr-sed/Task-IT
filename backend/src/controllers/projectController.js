import Project from "../models/project.js";
import User from "../models/user.js";

import dotenv from "dotenv";
import Invite from "../models/invite.js";
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
    if (req.permissionLevel !== 3)
        return res
            .status(403)
            .json({ message: "You do not have permission to delete this project" });
    try {
        const project = req.project; // Retrieved from permission middleware
        await Project.findByIdAndDelete(project._id);
        await Invite.deleteMany({ projectId: project._id });
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Internal server error" });
    }}

// Get project details
export async function getProject(req, res) {
    if (req.permissionLevel === 0)
        return res
            .status(403)
            .json({ message: "You do not have access to this project" });

    res.status(200).json({ project: req.project });
}

// Fetch all projects for the authenticated user
export async function fetchProjects(req, res) {
    try {
        const userId = req.userId;
        const projects = await Project.find({
            $or: [
                { ownedBy: userId }, // if your field is called ownedBy (based on your earlier code)
                { "members.id": userId },
            ],
        });

        res.status(200).json({ projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Update member role
export async function updateRole(req, res) {
    try {
        const { memberId } = req.params;
        const { role } = req.body;

        if (req.permissionLevel !== 3)
            return res
                .status(403)
                .json({ message: "You do not have permission to update member roles" });

        const project = req.project; // Retrieved from permission middleware

        const member = project.members.find(
            (m) => m.id?.toString() === memberId.toString()
        );

        if (!member) {
            return res
                .status(404)
                .json({ message: "Member not found in this project" });
        }

        member.role = role;
        await project.save();

        res
            .status(200)
            .json({ message: "Member role updated successfully", project });
    } catch (error) {
        console.error("Error updating member role:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteUser(req, res) {
    if (req.permissionLevel < 2)
        return res.status(403).json({
            message: "You do not have permission to remove members from this project",
        });

    try {
        const { userId } = req.params;

        // Ensure we have valid IDs
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Check permissions
        if (req.permissionLevel < 2) {
            return res.status(403).json({
                message:
                    "You do not have permission to remove members from this project",
            });
        }

        // Get fresh project data to avoid concurrency issues
        const project = req.project; // Retrieved from permission middleware

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Convert IDs to strings for accurate comparison
        const memberIndex = project.members.findIndex(
            (m) => m.id && m.id.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            return res
                .status(404)
                .json({ message: "Member not found in this project" });
        }

        // Remove the member using array splice method
        project.members.splice(memberIndex, 1);

        // Save the updated project
        const updatedProject = await project.save();

        // Confirm the member was actually removed
        const memberStillExists = updatedProject.members.some(
            (m) => m.id && m.id.toString() === userId.toString()
        );

        if (memberStillExists) {
            return res.status(500).json({
                message: "Failed to remove member from project",
            });
        }

        // Return success response
        res.status(200).json({
            message: "Member removed successfully",
            project: updatedProject,
        });
    } catch (error) {
        console.error("Error removing member from project:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


/* ──────────────────────────────────────────────
   Export as grouped object
────────────────────────────────────────────── */
export default {
    createProject,
    editProject,
    deleteProject,
};
