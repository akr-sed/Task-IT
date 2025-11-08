import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({

        userId: {
            type: String,
        },
        code: {type: Number, required: true},
        type: {
            type: String,
            enum: ['password','register','delete','email'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600 // <-- 600 seconds = 10 minutes
        },

        note: String

    },

    {
        strict: 'throw', // throws if extra fields not in schema

    });

export default mongoose.model('Code', codeSchema);
