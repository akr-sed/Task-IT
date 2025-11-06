import mongoose from "mongoose";

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
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        strict: "throw",
    }
);

export default mongoose.model("Task", taskSchema);
