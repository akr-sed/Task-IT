import mongoose from "mongoose";
import {hash} from "bcrypt";

const userSchema = new mongoose.Schema({


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
            match: /.+@.+\..+/
        },
        passwordHash:{
            type:String, required:true,//minlength: 8
        },
        createdAt:{type:Date, default: Date.now,expires: 600},

    },

    {
        strict: 'throw', // throws if extra fields not in schema
    });


// Hash before saving
userSchema.pre('save', async function (next) {

    try {
        const saltRounds = 10;
        this.passwordHash = await hash(this.passwordHash, saltRounds);
        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model('TempUser', userSchema);
