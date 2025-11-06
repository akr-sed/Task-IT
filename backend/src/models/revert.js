import mongoose from "mongoose";
import {sign} from "jsonwebtoken"


// this model is used when someone changes the email address and wants it back (hacked)
const revertSchema = new mongoose.Schema({

        userId: {
            type: String,
            required: true
        },
        token: {type: String},
        email: {
            type: String,
            required: true,
            unique: true,
            match: /.+@.+\..+/
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 2592000 // <-- 30 day to revert email
        },

    },

    {
        strict: 'throw', // throws if extra fields not in schema

    });

// Hash before saving
revertSchema.pre('save', async function (next) {
    const payload = { userId: this.userId };
    this. token = sign(payload, process.env.SECRET + "EMAIL", { expiresIn: '30d' });
    next()
});

export default  mongoose.model('Revert', revertSchema);