import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    device: {
      deviceId: {
        type: String,
        required: true,
      },
      deviceName: {
        type: String,
        default: "Unknown",
      },
      deviceOsVersion: {
        type: String,
        required: true,
      },
    },

    ip: {
      type: String,
    },

    token: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },

  {
    strict: "throw", // throws if extra fields not in schema
  }
);

// Hash before saving
tokenSchema.pre("save", async function (next) {
  const payload = { userId: this.userId };

  // automatically generates a token when creating a new session
  if(!this.token)
  this.token = jwt.sign(payload, process.env.SECRET, { expiresIn: "30d" });
  next();
});

export default mongoose.model("Session", tokenSchema);

