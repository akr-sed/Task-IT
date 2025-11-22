import Project from "../models/project.js";

export default async function checkPermission(req, res, next) {
    //TODO: implement later to check permission
    // OWNER = 3
    // ADMIN = 2
    // MEMBER = 1
    // NONE = 0

    // remember here we have to check for the projectId either from the params or the body.
    const projectId = req.params.projectId || req.body.projectId;
    // remember here we check if the projectId is sent.
    if (!projectId) {
        return res.status(400).json({error: "Project ID is required."});
    }
    // remember here we check if a project with this id exists.
    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({error: "Project not found."});
    }

    // remember here we attach all what we need in the request.
    req.project = project;
    // remember the project to not fetch for it each time we will pass it directly since all the routes of the project will use it.
    req.permissionLevel = 3;
    // remember the granted permission.

    next();
}