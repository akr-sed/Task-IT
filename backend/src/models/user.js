import mongoose from "mongoose";
import { hash } from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    // image:  {
    //     type: {
    //         data: Buffer,
    //         contentType: String,
    //     }, default: null,
    //     required: false
    // },
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 50,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+@.+\..+/,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
    },

    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },

  {
    strict: "throw", // throws if extra fields not in schema
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Hash before saving
userSchema.pre("save", async function (next) {
  // Hash password if it was modified (includes new users)
  if (!this.isModified("passwordHash")) return next();

  try {
    const saltRounds = 10;
    this.passwordHash = await hash(this.passwordHash, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", userSchema);
