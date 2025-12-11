import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // unique id for each comment
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        text: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } } // only track createdAt
);

const taskSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
        activity: { type: String },
        title: { type: String, required: true },
        description: { type: String },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        status: {
            type: String,
            enum: ["todo", "in progress", "done", "to review"],
            default: "todo",
        },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        dueDate: { type: Date },
        comments: [commentSchema],
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        strict: "throw",
    }
);

// Optimize common task queries by project/status/assignee/due date
taskSchema.index({ projectId: 1, status: 1 }, { name: "task_project_status_idx" });
taskSchema.index({ projectId: 1, assignedTo: 1 }, { name: "task_project_assignee_idx" });
taskSchema.index({ projectId: 1, dueDate: 1 }, { name: "task_project_due_idx" });
taskSchema.index({ assignedTo: 1 }, { name: "task_assignee_idx" }); // For user tasks queries

export default mongoose.model("Task", taskSchema);
