import TempUser from "../models/tempUser.js";
import Code from "../models/code.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// User signup controller
export const userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password." });
    }

    // Check if the email already exists
    const existingUser = await TempUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Create a temporary user
    const tempUser = new TempUser({
      name,
      email,
      passwordHash: password, // assuming hashing is done in model middleware
    });

    await tempUser.save();

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save the verification code in DB
    const code = new Code({
      userId: tempUser._id,
      code: verificationCode,
      type: "register",
    });

    await code.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode, name);

    // Respond to client
    res.status(201).json({
      message:
        "Signup successful! Please check your email for the verification code.",
      tempUser,
    });
  } catch (error) {
    console.error("Error in userRegistration controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
