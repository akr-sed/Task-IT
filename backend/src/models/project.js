import mongoose from "mongoose";

/**{
 // this means it is an object ID of some object in the database
  type: mongoose.Schema.Types.ObjectId,

 // this tells mongoDB that this object is from users collection (record on the users table)
  ref: "users"
}*/


const projectSchema = new mongoose.Schema(
    {
        ownedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        name: { type: String, required: true, unique: true },
        displayName: String,
        description: String,
        members: [
            {
                id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
                role: { type: String, enum: ['admin', 'member'], default: 'member' }
            }
        ],
    },
    {
        strict: 'throw',
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Frequent lookups by owner and membership
projectSchema.index({ ownedBy: 1 }, { name: "project_ownedBy_idx" });
projectSchema.index({ "members.id": 1 }, { name: "project_member_idx" });

export default mongoose.model('Project', projectSchema);
