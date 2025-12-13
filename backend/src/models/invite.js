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

// Fast lookups for invitation flows
inviteSchema.index({ inviteCode: 1 }, { name: "invite_code_idx" });
inviteSchema.index({ projectId: 1, invitedEmail: 1 }, { name: "invite_project_email_idx" });
inviteSchema.index({ projectId: 1, invitedUserId: 1 }, { name: "invite_project_user_idx" });



// validate that at least one exist
inviteSchema.pre("validate", function () {
    if (!this.invitedUserId && !this.invitedEmail) {
        return next(new Error("Either invitedUserId or invitedEmail must be provided."));
    }

    // todo: validate if the user owns the project
    // next();
});

export default mongoose.model("Invite", inviteSchema);
