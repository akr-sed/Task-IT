import Project from "../models/project.js";

export default async function checkIfUserBelongsToProject(data) {
    // Ensure we have userId and projectId
    const userId = data.userId;
    if (!userId) throw new Error("user not found");

    // Get project either from data or database
    const project = data.project || await Project.findById(data.projectId);
    if (!project) throw new Error("project not found");

    // Check ownership or membership
    const isOwner = project.ownedBy.toString() === userId;
    const isMember = project.members?.some(m => m.id?.toString() === userId.toString());

    return isOwner || isMember;
}
