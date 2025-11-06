import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
        invitedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
        invitedEmail: { type: String, default: null },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        inviteCode: { type: String, required: true },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 2592000 // <-- 30 Days
        },
    },
    {
        strict: "throw",
    }
);



export default mongoose.model("Invite", inviteSchema);
