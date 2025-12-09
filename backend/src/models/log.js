import mongoose from "mongoose";

/**
 * Notification types for proper routing and display
 * - TASK_CREATED: New task created in project
 * - TASK_ASSIGNED: Task assigned to a user
 * - TASK_STATUS_CHANGED: Task status updated
 * - TASK_EDITED: Task details modified
 * - TASK_DELETED: Task removed
 * - TASK_COMMENT: New comment on a task
 * - PROJECT_INVITE_SENT: Invitation sent to join project
 * - PROJECT_INVITE_ACCEPTED: User accepted project invitation
 * - PROJECT_INVITE_DECLINED: User declined project invitation
 * - PROJECT_MEMBER_REMOVED: Member removed from project
 * - PROJECT_ROLE_UPDATED: Member role changed
 * - PROJECT_OWNERSHIP_TRANSFERRED: Project ownership transferred
 * - PROJECT_EDITED: Project details modified
 * - PROJECT_DELETED: Project deleted
 */

const logSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        type: { 
            type: String, 
            enum: [
                "TASK_CREATED",
                "TASK_ASSIGNED", 
                "TASK_STATUS_CHANGED",
                "TASK_EDITED",
                "TASK_DELETED",
                "TASK_COMMENT",
                "PROJECT_INVITE_SENT",
                "PROJECT_INVITE_ACCEPTED",
                "PROJECT_INVITE_DECLINED",
                "PROJECT_MEMBER_REMOVED",
                "PROJECT_ROLE_UPDATED",
                "PROJECT_OWNERSHIP_TRANSFERRED",
                "PROJECT_EDITED",
                "PROJECT_DELETED",
                "GENERAL"
            ],
            default: "GENERAL"
        },
        userAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // recipient of the notification
        userCreated: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // user who triggered the action
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: false },
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: false },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        isRead: { type: Boolean, default: false },
        // Link for navigation - computed based on type, projectId, taskId
        link: { type: String, required: false },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        strict: "throw",
    }
);

// Compound index to prevent duplicate notifications within 5 seconds
// This helps prevent race conditions and duplicate notification creation
logSchema.index(
    {
        userAssigned: 1,
        type: 1,
        taskId: 1,
        projectId: 1,
        createdAt: -1
    },
    { name: "notification_dedup_index" }
);

export default mongoose.model("Log", logSchema);
