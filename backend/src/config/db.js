import mongoose from "mongoose"
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("mongodb connected successfully")
  } catch (error) {
    console.error("error connecting to mongodb" , error);
    process.exit(1);
  }
};
