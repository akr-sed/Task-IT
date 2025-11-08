/**
 * ========================================
 * USER CONTROLLER MODULE
 * ========================================
 * 
 * This controller handles all user-related operations for the Task-IT application.
 * 
 * AUTHENTICATION FLOW:
 * -------------------
 * 1. Registration: userRegistration -> verifyEmail -> (middleware: tokenGenerator)
 * 2. Login: userLogin -> (middleware: tokenGenerator)
 * 3. Logout: userLogout
 * 
 * PASSWORD RESET FLOW:
 * -------------------
 * 1. resetPassword -> verifyResetCode -> setNewPassword -> (middleware: tokenGenerator)
 * 
 * USER DATA OPERATIONS:
 * --------------------
 * - getUser: Retrieve single user by ID
 * - getUsersByIds: Retrieve multiple users by IDs (for team/project views)
 * 
 * HELPER OPERATIONS:
 * -----------------
 * - resendVerificationCode: Resend email verification code
 * 
 * SECURITY FEATURES:
 * -----------------
 * - Email verification for new accounts (6-digit codes)
 * - Password reset with time-limited tokens (15 minutes)
 * - One-time use codes (deleted after verification)
 * - Hashed passwords and tokens in database
 * - No email enumeration (same response for valid/invalid emails)
 * - Sensitive data excluded from API responses
 * 
 * DEPENDENCIES:
 * ------------
 * - Models: User, TempUser, Code, Session
 * - Utils: sendVerificationEmail, sendPasswordResetEmail
 * - Libraries: crypto, bcrypt
 * 
 * @module controllers/userController
 * @author Task-IT Development Team
 */

import TempUser from "../models/tempUser.js";
import Code from "../models/code.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";
import User from "../models/user.js";
import Session from "../models/session.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

/* ========================================
 * REGISTRATION & EMAIL VERIFICATION
 * ======================================== */

/**
 * User Registration Controller
 * 
 * Handles the initial user signup process by creating a temporary user record
 * and sending a verification email with a 6-digit code.
 * 
 * Flow:
 * 1. Validates that name, email, and password are provided
 * 2. Checks if email is already registered in TempUser collection
 * 3. Creates a temporary user record (not yet verified)
 * 4. Generates a random 6-digit verification code
 * 5. Saves the verification code with type "register"
 * 6. Sends verification email to the user
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message and tempUser data
 * 
 * @status 201 - Signup successful, verification email sent
 * @status 400 - Missing required fields or email already registered
 * @status 500 - Internal server error
 */
export const userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    // Check if email already exists in temporary users
    const existingUser = await TempUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create temporary user record (awaiting email verification)
    const tempUser = new TempUser({
      name,
      email,
      passwordHash: password, // Note: This will be hashed by the model's pre-save hook
    });

    await tempUser.save();

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save verification code with 15-minute expiration (handled by model)
    const code = new Code({
      userId: tempUser._id,
      code: verificationCode,
      type: "register", // Indicates this code is for email verification
    });

    await code.save();

    // Send verification email to user
    await sendVerificationEmail(email, verificationCode, name);

    res.status(201).json({
      message:
        "Signup successful! Please check your email for verification code",

      tempUser,
    });
  } catch (error) {
    console.error("error in the signupController:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

/**
 * Email Verification Controller
 * 
 * Verifies the user's email by checking the verification code and converts
 * the temporary user to a permanent user account.
 * 
 * Flow:
 * 1. Validates that tempUserId and verification code are provided
 * 2. Looks up the verification code in the Code collection
 * 3. Retrieves the temporary user data
 * 4. Creates a permanent User record with the temp user's data
 * 5. Cleans up temporary records (TempUser and Code)
 * 6. Passes user data to next middleware for session/token generation
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.tempUserId - ID of the temporary user record
 * @param {string} req.body.verificationCode - 6-digit verification code
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() middleware on success (typically tokenGenerator)
 * 
 * @status 200 - Handled by next middleware
 * @status 400 - Missing fields, invalid code, or expired registration
 * @status 500 - Internal server error
 */

export const verifyEmail = async (req, res, next) => {
  try {
    const { tempUserId, verificationCode } = req.body;

    // Validate required fields
    if (!tempUserId || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Please provide tempUserId and verification code" });
    }

    // Find the verification code record
    const codeRecord = await Code.findOne({
      userId: tempUserId,
      code: verificationCode,
      type: "register",
    });

    if (!codeRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    // Get temporary user data
    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) {
      return res.status(400).json({
        message: "User registration has expired. Please sign up again.",
      });
    }

    // Create permanent user account
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      passwordHash: tempUser.passwordHash,
    });

    await newUser.save();

    // Clean up temporary records to maintain database hygiene
    await TempUser.findByIdAndDelete(tempUserId);
    await Code.findByIdAndDelete(codeRecord._id);

    // Attach user info to request for next middleware (e.g., token generation)
    req.user = newUser;
    req.userId = newUser._id;
    next();
  } catch (error) {
    console.error("Verification error:", error);
    res
      .status(500)
      .json({ message: "Server error during verification process" });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { tempUserId } = req.body;

    // Validate required field
    if (!tempUserId) {
      return res.status(400).json({ message: "Please provide tempUserId" });
    }

    // Find temporary user record
    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) {
      return res.status(400).json({
        message: "User registration has expired. Please sign up again.",
      });
    }

    // Delete any old verification codes to prevent multiple valid codes
    await Code.deleteMany({ userId: tempUserId, type: "register" });

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save new verification code
    const code = new Code({
      userId: tempUserId,
      code: verificationCode,
      type: "register",
    });

    await code.save();

    // Resend verification email with new code
    await sendVerificationEmail(
      tempUser.email,
      verificationCode,
      tempUser.name
    );

    res.status(200).json({
      message: "Verification code has been resent to your email",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    res
      .status(500)
      .json({ message: "Server error while resending verification code" });
  }
};
export const userLogin = async (req, res, next) => {
  try {
    // Pass control to next middleware (e.g., token generation)
    next();
  } catch (error) {
    console.error("Error in the userLogin controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const userLogout = async (req, res) => {
  try {
    // Extract token from Authorization header (format: "Bearer <token>")
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Delete the session record from database
    const result = await Session.findOneAndDelete({ token });

    if (!result) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in userLogout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email is provided
    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }
    
    // Look up user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Return same response to prevent email enumeration attacks
      return res.status(200).json({
        message: "If that email is registered, a reset code has been sent.",
      });
    }
    
    // Delete any existing password reset codes for security
    await Code.deleteMany({ userId: user._id, type: "password" });

    // Generate new 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    const code = new Code({
      userId: user._id,
      code: resetCode,
      type: "password", // Indicates this code is for password reset
    });
    await code.save();
    
    // Send password reset email
    await sendPasswordResetEmail(email, resetCode, user.name);
    
    res.status(200).json({
      message: "If that email is registered, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    
    // Validate required fields
    if (!email || !resetCode) {
      return res
        .status(400)
        .json({ message: "Please provide email and reset code" });
    }
    
    // Look up user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or reset code" });
    }

    // Verify the reset code matches
    const codeRecord = await Code.findOne({
      userId: user._id,
      code: resetCode,
      type: "password",
    });
    if (!codeRecord) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Delete the code immediately to prevent reuse (one-time use token)
    await Code.deleteOne({ _id: codeRecord._id });
    
    // Generate a cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Store hashed version of token in database for security
    user.resetToken = await bcrypt.hash(resetToken, 10);
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    await user.save();

    // Return plain token to client (they'll need this to set new password)
    res.status(200).json({
      message: "Reset code verified",
      userId: user._id,
      resetToken: resetToken, // Plain token sent to client
    });
  } catch (error) {
    console.error("Error in verifyResetCode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const setNewPassword = async (req, res, next) => {
  try {
    const { userId, resetToken, newPassword } = req.body;
    
    // Validate required fields
    if (!userId || !newPassword || !resetToken) {
      return res.status(400).json({
        message: "Please provide userId, resetToken, and new password",
      });
    }
    
    // Look up user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    // Verify reset token exists and hasn't expired
    if (
      !user.resetToken ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < Date.now()
    ) {
      return res.status(400).json({
        message:
          "Reset token is invalid or expired. Please restart the password reset process.",
      });
    }
    
    // Verify the provided token matches the hashed token in database
    const isValidToken = await bcrypt.compare(resetToken, user.resetToken);
    if (!isValidToken) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Update password (will be hashed by User model's pre-save hook)
    user.passwordHash = newPassword;
    await user.save();

    // Attach user info to request for next middleware (e.g., token generation)
    req.user = user;
    req.userId = user._id;
    
    // Call next middleware (typically tokenGenerator to log user in)
    next();
  } catch (error) {
    console.error("Error in setNewPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getUsersByIds = async (req, res) => {
  try {
    const { userIds } = req.body;

    // Validate userIds is a non-empty array
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Valid user IDs are required" });
    }

    // Find users by IDs, excluding sensitive fields
    const users = await User.find(
      { _id: { $in: userIds } }, // Query: find all users whose ID is in the array
      { passwordHash: 0, resetToken: 0, resetTokenExpiry: 0 } // Projection: exclude sensitive fields
    );

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error in getUsersByIds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user by ID, excluding sensitive fields
    const user = await User.findById(
      userId,
      { passwordHash: 0, resetToken: 0, resetTokenExpiry: 0 } // Projection: exclude sensitive fields
    );

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};