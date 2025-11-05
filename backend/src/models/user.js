import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
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