import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        userAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false }, // ex: user assigned to a task
        userCreated: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false }, // ex: user who created something
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: false }, // ex: project related to the log
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "tasks", required: false }, // ex: task related to the log
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        strict: "throw",
    }
);

export default mongoose.model("Log", logSchema);
