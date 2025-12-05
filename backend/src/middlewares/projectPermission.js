// password.js
import Project from "../models/project.js";

export default async function checkPermission(req, res, next) {
    try {

        
        // OWNER = 3
        // ADMIN = 2
        // MEMBER = 1
        // NONE = 0


        // remember here we have to check for the projectId either from the params or the body.
        const projectId = req.params.projectId || req.body.projectId;
        // remember here we check if the projectId is sent.
        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required." });
        }
        // remember here we check if a project with this id exists.
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }
        // remember this from the auth middleware.
        const userId = req.userId.toString();
        // remember here we have to convert both userId to string to allow the comparison after with the ones in the members.
        let permissionLevel = 0;
        // remember this is the part of the permission where we first have to put the user without permission using the 0 permission.

        // remember each time we check for the id we store in the document by first transforming it to string to allow the comparison between the objectid of mongo and the id.
        if (project.ownedBy.toString() === userId) {
            permissionLevel = 3;
            // remember we will grant for him the owner permission.
        } else {
            // remember here we loop through each user in the member and check if it has the same id then we keep
            const member = project.members.find(m => m.id?.toString() === userId);

            if (member) {
                permissionLevel = member.role === "admin" ? 2 : 1;
                //  remember here the permissionLevel will be equal to 2 if it is an admin else 1 since it exists and he is a simple user.
            }
        }

        if (permissionLevel === 0) {
            return res.status(403).json({ error: "Access denied — not part of this project." });
        }
        
        // remember here we attach all what we need in the request.
        req.project = project;
        // remember the project to not fetch for it each time we will pass it directly since all the routes of the project will use it.
        req.permissionLevel = permissionLevel;
        // remember the granted permission.

        next();
    } catch (error) {
        console.error("Permission middleware error:", error);
        res.status(500).json({ error: "Server error while checking permissions." });
    }
}