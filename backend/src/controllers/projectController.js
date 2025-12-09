import Project from "../models/project.js";
import User from "../models/user.js";
import Invite from "../models/invite.js";
import { sendProjectInvitation } from "../utils/sendEmail.js";
import createLog from "../utils/createLog.js";
import createProjectNotification, { 
  notifyProjectAdmins, 
  notifyAllProjectMembers,
  notifyUsers 
} from "../utils/createProjectNotification.js";
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

    // LOG USER ACTION
    // FIXME : later this should be taken care of
    // await createLog({
    //   title: "Project Created",
    //   content: `Project '${name}' created by user ID ${req.userId}`,
    //   userCreated: req.userId,
    //   projectId: newProject._id,
    //   priority: "low",
    // });

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

  // Get editor info
  const editor = await User.findById(req.userId);
  const editorName = editor?.name || "Someone";

  // Notify all project members about the edit
  await notifyAllProjectMembers({
    project,
    projectId: project._id,
    userCreated: req.userId,
    title: "Project Updated",
    content: `${editorName} updated project "${project.displayName || project.name}"`,
    type: "PROJECT_EDITED",
    priority: "low",
    includeOwner: true,
    excludeUserId: req.userId,
  });

  res.status(200).json({ message: "Project updated successfully", project });
}

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
      $or: [{ ownedBy: userId }, { "members.id": userId }],
    });
    // FIXME : later this should be taken care of

    // await createLog({
    //   title: "Projects Retrieved",
    //   content: `User ID ${userId} fetched their project list`,
    //   userCreated: userId,
    //   priority: "low",
    // });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete project
export async function deleteProject(req, res) {
  if (req.permissionLevel !== 3)
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this project" });
  try {
    const project = req.project; // Retrieved from permission middleware
    
    // Get deleter info before deletion
    const deleter = await User.findById(req.userId);
    const deleterName = deleter?.name || "Someone";
    const projectName = project.displayName || project.name;
    
    // Collect member IDs before deletion for notification
    const memberIds = project.members?.map(m => m.id) || [];
    
    await Project.findByIdAndDelete(project._id);
    await Invite.deleteMany({ projectId: project._id });

    // Notify all former members that the project was deleted
    if (memberIds.length > 0) {
      await notifyUsers({
        userIds: memberIds,
        projectId: null, // Project no longer exists
        userCreated: req.userId,
        title: "Project Deleted",
        content: `${deleterName} deleted the project "${projectName}"`,
        type: "PROJECT_DELETED",
        priority: "high",
        excludeUserId: req.userId,
      });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
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

    // Get updater and affected member info
    const updater = await User.findById(req.userId);
    const updaterName = updater?.name || "Someone";
    const affectedMember = await User.findById(memberId);
    const memberName = affectedMember?.name || "A member";

    // Notify the member whose role was updated
    await notifyUsers({
      userIds: [memberId],
      projectId: project._id,
      userCreated: req.userId,
      title: "Your Role Updated",
      content: `${updaterName} changed your role to "${role}" in "${project.displayName || project.name}"`,
      type: "PROJECT_ROLE_UPDATED",
      priority: "medium",
      excludeUserId: req.userId,
    });

    // Notify other admins
    await notifyProjectAdmins({
      project,
      projectId: project._id,
      userCreated: req.userId,
      title: "Member Role Updated",
      content: `${updaterName} changed ${memberName}'s role to "${role}"`,
      type: "PROJECT_ROLE_UPDATED",
      priority: "low",
      includeOwner: true,
      excludeUserId: req.userId,
    });

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

    // Get remover and removed member info
    const remover = await User.findById(req.userId);
    const removerName = remover?.name || "Someone";
    const removedMember = await User.findById(userId);
    const memberName = removedMember?.name || "A member";

    // Notify the removed member
    await notifyUsers({
      userIds: [userId],
      projectId: project._id,
      userCreated: req.userId,
      title: "Removed from Project",
      content: `${removerName} removed you from "${project.displayName || project.name}"`,
      type: "PROJECT_MEMBER_REMOVED",
      priority: "high",
      excludeUserId: req.userId,
    });

    // Notify admins about the removal
    await notifyProjectAdmins({
      project: updatedProject,
      projectId: project._id,
      userCreated: req.userId,
      title: "Member Removed",
      content: `${removerName} removed ${memberName} from the project`,
      type: "PROJECT_MEMBER_REMOVED",
      priority: "low",
      includeOwner: true,
      excludeUserId: req.userId,
    });

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

// Transfer ownership
export async function transferOwner(req, res) {
  if (req.permissionLevel !== 3)
    return res
      .status(403)
      .json({ message: "You do not have permission to transfer ownership" });
  try {
    const { newOwnerId } = req.body;
    const project = req.project; // Retrieved from permission middleware
    const newOwnerMember = project.members.find(
      (m) => m.id?.toString() === newOwnerId.toString()
    );

    if (!newOwnerMember) {
      return res
        .status(404)
        .json({ message: "New owner must be a member of the project" });
    }

    // Update ownership
    // Store current owner ID before changing ownership
    const previousOwnerId = project.ownedBy;

    // Update ownership
    project.ownedBy = newOwnerId;

    // Remove the new owner from members array
    project.members = project.members.filter(
      (member) => member.id.toString() !== newOwnerId.toString()
    );

    // Change previous owner's role to admin
    const previousOwnerMemberIndex = project.members.findIndex(
      (member) => member.id.toString() === previousOwnerId.toString()
    );

    // If previous owner wasn't in members list already, add them

    project.members.push({
      id: previousOwnerId,
      role: "admin",
    });

    await project.save();

    // Get user names for notifications
    const transferrer = await User.findById(req.userId);
    const transferrerName = transferrer?.name || "Someone";
    const newOwner = await User.findById(newOwnerId);
    const newOwnerName = newOwner?.name || "Someone";

    // Notify the new owner
    await notifyUsers({
      userIds: [newOwnerId],
      projectId: project._id,
      userCreated: req.userId,
      title: "You're Now the Project Owner",
      content: `${transferrerName} transferred ownership of "${project.displayName || project.name}" to you`,
      type: "PROJECT_OWNERSHIP_TRANSFERRED",
      priority: "high",
      excludeUserId: req.userId,
    });

    // Notify all members about ownership change
    await notifyAllProjectMembers({
      project,
      projectId: project._id,
      userCreated: req.userId,
      title: "Project Ownership Changed",
      content: `${newOwnerName} is now the owner of "${project.displayName || project.name}"`,
      type: "PROJECT_OWNERSHIP_TRANSFERRED",
      priority: "medium",
      includeOwner: false, // New owner already notified above
      excludeUserId: req.userId,
    });

    res
      .status(200)
      .json({ message: "Project ownership transferred successfully", project });
  } catch (error) {
    console.error("Error transferring project ownership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Send project invite
export async function invite(
  req,
  res
  // , next
) {
  // todo: invite via sending an email either he provides a user id and then we fetch the email , or he sends an email
  try {
    if (req.permissionLevel !== 3)
      return res.status(403).json({
        message: "You don't have permission to invite users to this project",
      });
    const project = req.project; // Retrieved from permission middleware

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email must be provided for invitation",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }
    if (user._id.toString() === project.ownedBy.toString())
      return res
        .status(400)
        .json({ message: "you cannot send an invite to yourself" });

    let invitedUser = user;
    let invitedEmail = email;

    // Check if user is already a member
    if (invitedUser) {
      const isMember = project.members.some(
        (member) => member.id?.toString() === invitedUser._id.toString()
      );

      if (isMember) {
        return res
          .status(400)
          .json({ message: "User is already a member of this project" });
      }
    }

    // Generate a unique invite code
    const inviteCode =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Create an invitation record
    const invite = new Invite({
      projectId: project._id,
      invitedUserId: user._id || null,
      invitedEmail: invitedEmail,
      invitedBy: req.project.ownedBy,
      inviteCode: inviteCode,
    });

    await invite.save();

    // Create the invitation link
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${baseUrl}/projects/${project._id}/invite/${invite._id}/${inviteCode}`;

    // Send invitation email

    await sendProjectInvitation(
      invitedEmail,
      inviteCode,
      invitedUser?.name || "there",
      project.name,
      "taskit Team",
      inviteLink
    );

    // Get inviter name
    const inviter = await User.findById(req.userId);
    const inviterName = inviter?.name || "Someone";

    // Notify the invited user (if they exist in the system)
    if (invitedUser) {
      await notifyUsers({
        userIds: [invitedUser._id],
        projectId: project._id,
        userCreated: req.userId,
        title: "Project Invitation",
        content: `${inviterName} invited you to join "${project.displayName || project.name}"`,
        type: "PROJECT_INVITE_SENT",
        priority: "high",
        link: inviteLink,
      });
    }

    return res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Error sending project invitation:", error);
    return res.status(500).json({ message: "Failed to send invitation" });
  }
}

export async function acceptInvite(req, res) {
  const { inviteId, inviteCode } = req.params;
  if (!inviteId || !inviteCode) {
    return res.status(400).json({ message: "Invalid invite link" });
  }

  try {
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    if (invite.inviteCode !== inviteCode) {
      return res.status(400).json({ message: "Invalid invite code" });
    }
    const project = await Project.findById(invite.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const userId = req.userId;

    // Check if the invitation is for this user
    if (
      invite.invitedUserId &&
      invite.invitedUserId.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "This invitation is not for your account" });
    }

    // If invitation was sent by email, check if current user's email matches
    if (invite.invitedEmail) {
      const user = await User.findById(userId);
      if (!user || user.email !== invite.invitedEmail) {
        return res
          .status(403)
          .json({
            message: "This invitation is for a different email address",
          });
      }
    }

    // Check if user is already a member
    const isMember = project.members.some(
      (member) => member.id?.toString() === userId.toString()
    );

    if (isMember) {
      return res
        .status(400)
        .json({ message: "You are already a member of this project" });
    }

    // Add user to project members
    project.members.push({
      id: userId,
      role: "member", // Default role for invited users
    });
    await project.save();
    await Invite.findByIdAndDelete(inviteId);

    // Get the new member's name
    const newMember = await User.findById(userId);
    const newMemberName = newMember?.name || "Someone";

    // Notify the project owner and admins
    await notifyProjectAdmins({
      project,
      projectId: project._id,
      userCreated: userId,
      title: "New Team Member Joined",
      content: `${newMemberName} accepted the invitation and joined "${project.displayName || project.name}"`,
      type: "PROJECT_INVITE_ACCEPTED",
      priority: "medium",
      includeOwner: true,
      excludeUserId: userId,
    });

    res
      .status(200)
      .json({ message: "Invitation accepted successfully", project });
  } catch (error) {
    console.error("Error accepting project invitation:", error);
    return res.status(500).json({ message: "Failed to accept invitation" });
  }
}
// Add this function to projectController.js

export async function declineInvite(req, res) {
  try {
    const { projectId, inviteId, code } = req.params;

    // Find the invitation in the database
    const invite = await Invite.findById(inviteId);

    // Check if invitation exists
    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invitation not found or already expired" });
    }

    // Verify the project ID matches the invitation
    if (invite.projectId.toString() !== projectId) {
      return res.status(400).json({ message: "Invalid invitation details" });
    }

    // Get current user from auth middleware
    const currentUserId = req.userId;
    const user = req.user || (await User.findById(currentUserId));

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify that the invitation was sent to this user
    const isInvitedUser =
      (invite.invitedUserId &&
        invite.invitedUserId.toString() === currentUserId) ||
      (invite.invitedEmail && invite.invitedEmail === user.email);

    if (!isInvitedUser) {
      return res.status(403).json({
        message: "You are not authorized to decline this invitation",
      });
    }

    // Get project details for the response
    const project = await Project.findById(projectId);
    if (!project) {
      await Invite.findByIdAndDelete(inviteId);

      return res.status(404).json({ message: "Project no longer exists" });
    }

    // Delete the invitation
    await Invite.findByIdAndDelete(inviteId);

    // Get the decliner's name
    const decliner = await User.findById(currentUserId);
    const declinerName = decliner?.name || "Someone";

    // Notify the person who sent the invite
    await notifyUsers({
      userIds: [invite.invitedBy.toString()],
      projectId: project._id,
      userCreated: currentUserId,
      title: "Invitation Declined",
      content: `${declinerName} declined the invitation to join "${project.displayName || project.name}"`,
      type: "PROJECT_INVITE_DECLINED",
      priority: "low",
    });

    // Return success response
    return res.status(200).json({
      message: `You have successfully declined the invitation to ${project.name}`,
      project: {
        id: project._id,
        name: project.name,
      },
    });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return res.status(500).json({ message: "Failed to decline invitation" });
  }
}
// Get invitation details
export async function getInvitation(req, res) {
  try {
    const { inviteId } = req.params;

    if (!inviteId) {
      return res.status(400).json({ message: "Invitation ID is required" });
    }

    // Find the invitation
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invitation not found or expired" });
    }

    // Find the project
    const project = await Project.findById(invite.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project no longer exists" });
    }

    // Find the inviter
    const inviter = await User.findById(invite.invitedBy);

    return res.status(200).json({
      invitation: {
        id: invite._id,
        projectId: project._id,
        projectName: project.name,
        inviterName: inviter ? inviter.name : "A Taskit user",
        invitedEmail: invite.invitedEmail,
      },
    });
  } catch (error) {
    console.error("Error getting invitation details:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve invitation details" });
  }
}

// Add this function to userController.js
export async function fetchInvitations(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Find invitations by user ID or email
    const invitations = await Invite.find({
      $or: [{ invitedUserId: userId }, { invitedEmail: userEmail }],
    });
    const projectNames = {};
    for (const invite of invitations) {
      const project = await Project.findById(invite.projectId);
      projectNames[project?._id] = project?.name;
    }
    const invitorNames = {};
    const invitorEmails = {};
    for (const invite of invitations) {
      const invitor = await User.findById(invite.invitedBy);
      invitorNames[invite._id] = invitor ? invitor.name : "A Taskit user";
      invitorEmails[invite._id] = invitor ? invitor.email : "No email";
    }

    return res.status(200).json({
      invitations,
      projectNames,
      invitorNames,
      invitorEmails,
    });
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}