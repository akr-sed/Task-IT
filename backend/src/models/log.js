import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        strict: "throw",
    }
);

export default mongoose.model("Log", logSchema);
