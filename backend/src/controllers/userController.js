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
import mongoose from "mongoose";
import Project from "../models/project.js"
import Task from "../models/task.js"
// import Log from "../models/log.js"
import Invite from "../models/invite.js"
// import Revert from "../models/revert.js"

// User signup controller
export const userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    const existingUser = await TempUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create temporary user
    const tempUser = new TempUser({
      name,
      email,
      passwordHash: password,
    });

    await tempUser.save();

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save verification code
    const code = new Code({
      userId: tempUser._id,
      code: verificationCode,
      type: "register",
    });

    await code.save();

    // Send verification email
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

// Email verification controller
export const verifyEmail = async (req, res, next) => {
  try {
    const { tempUserId, verificationCode } = req.body;

    if (!tempUserId || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Please provide tempUserId and verification code" });
    }
    if (!tempUserId || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Please provide tempUserId and verification code" });
    }
    // Find the verification code
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

    // Get temp user data
    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) {
      return res.status(400).json({
        message: "User registration has expired. Please sign up again.",
      });
    }

    // Create permanent user
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      passwordHash: tempUser.passwordHash,
    });

    await newUser.save();

    // Clean up temporary records
    await TempUser.findByIdAndDelete(tempUserId);
    await Code.findByIdAndDelete(codeRecord._id);

    // Auto-link pending invitations to this new user
    // Find invitations sent to this email before user registered
    await Invite.updateMany(
      { 
        invitedEmail: newUser.email,
        invitedUserId: null  // Only update invitations that don't have userId yet
      },
      { 
        $set: { invitedUserId: newUser._id }
      }
    );

    // FIXME mayber create log for initial notification that welcomes the user 

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

// Resend verification code controller
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    // Find temp user by email
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      // Generic response to prevent email enumeration
      return res.status(200).json({
        message: "If that email is registered, a verification code has been sent.",
      });
    }

    // Check if code was sent recently (spam prevention - 60 second cooldown)
    const recentCode = await Code.findOne({
      userId: tempUser._id,
      type: "register",
      createdAt: { $gt: new Date(Date.now() - 60000) }, // Within last 60 seconds
    });

    if (recentCode) {
      return res.status(429).json({
        message: "Please wait 60 seconds before requesting another code.",
      });
    }

    // Delete old verification code if exists
    await Code.deleteMany({ userId: tempUser._id, type: "register" });

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save new verification code
    const code = new Code({
      userId: tempUser._id,
      code: verificationCode,
      type: "register",
    });

    await code.save();

    // Resend verification email
    await sendVerificationEmail(
      tempUser.email,
      verificationCode,
      tempUser.name
    );

    // Generic response to prevent email enumeration
    res.status(200).json({
      message: "If that email is registered, a verification code has been sent.",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    res
      .status(500)
      .json({ message: "Server error while resending verification code" });
  }
};

//Login controller
export const userLogin = async (req, res, next) => {
  try {
    next();
  } catch (error) {
    console.error("Error in the userLogin controller:", error); // Log the actual error
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userLogout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Delete the session
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
    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset code has been sent.",
      });
    }
    // Delete any existing password reset codes for this user
    await Code.deleteMany({ userId: user._id, type: "password" });

    // Generate and save new reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    const code = new Code({
      userId: user._id,
      code: resetCode,
      type: "password",
    });
    await code.save();
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
    if (!email || !resetCode) {
      return res
        .status(400)
        .json({ message: "Please provide email and reset code" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or reset code" });
    }

    const codeRecord = await Code.findOne({
      userId: user._id,
      code: resetCode,
      type: "password",
    });
    if (!codeRecord) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Delete the code to prevent reuse
    await Code.deleteOne({ _id: codeRecord._id });
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = await bcrypt.hash(resetToken, 10);
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    await user.save();

    res.status(200).json({
      message: "Reset code verified",
      userId: user._id,
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Error in verifyResetCode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setNewPassword = async (req, res, next) => {
  try {
    const { userId, resetToken, newPassword } = req.body;
    if (!userId || !newPassword || !resetToken) {
      return res.status(400).json({
        message: "Please provide userId, resetToken, and new password",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (
      !user.resetToken ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < Date.now()
    )
      return res.status(400).json({
        message:
          "Reset token is invalid or expired. Please restart the password reset process.",
      });
    const isValidToken = await bcrypt.compare(resetToken, user.resetToken);
    if (!isValidToken) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    user.passwordHash = newPassword;
    // Clear reset token after successful password reset
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.lastPasswordResetAt = new Date();
    await user.save();

    //passing the user information to the next middleware (tokenGenerator)
    req.user = user;
    req.userId = user._id;
    // call for the tokenGenerator middleware
    next();
  } catch (error) {
    console.error("Error in setNewPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get multiple users by IDs
export const getUsersByIds = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Valid user IDs are required" });
    }

    // Find users while excluding sensitive information
    const users = await User.find(
      { _id: { $in: userIds } },
      { passwordHash: 0, resetToken: 0, resetTokenExpiry: 0 }
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

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user while excluding sensitive information
    const user = await User.findById(
      userId,
      { passwordHash: 0, resetToken: 0, resetTokenExpiry: 0 }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user profile (name only)
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId; // From auth middleware

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({ message: "Name must be between 3 and 50 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    await user.save();

    res.status(200).json({ 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Request email change (sends verification code to new email)
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.userId; // From auth middleware

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    // Check if email format is valid
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete any existing email change codes for this user
    await Code.deleteMany({ userId: userId, type: "email" });

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save verification code with new email in note field
    const code = new Code({
      userId: userId,
      code: verificationCode,
      type: "email",
      note: newEmail // Store new email temporarily
    });
    await code.save();

    // Send verification email to NEW email address
    const { sendEmailChangeVerification } = await import("../utils/sendEmail.js");
    await sendEmailChangeVerification(newEmail, verificationCode, user.name);

    res.status(200).json({ 
      message: "Verification code sent to new email address",
      email: newEmail
    });
  } catch (error) {
    console.error("Error in requestEmailChange:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify email change code and update email
export const verifyEmailChange = async (req, res) => {
  try {
    const { verificationCode, newEmail } = req.body;
    const userId = req.userId; // From auth middleware

    if (!verificationCode || !newEmail) {
      return res.status(400).json({ message: "Verification code and new email are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the verification code
    const codeRecord = await Code.findOne({
      userId: userId,
      code: verificationCode,
      type: "email",
      note: newEmail
    });

    if (!codeRecord) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Check if email is still available
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Update email
    user.email = newEmail;
    await user.save();

    // Delete the verification code
    await Code.findByIdAndDelete(codeRecord._id);

    res.status(200).json({ 
      message: "Email updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Error in verifyEmailChange:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change password (requires current password)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password (will be hashed by pre-save hook)
    user.passwordHash = newPassword;
    await user.save();

    // Optionally: invalidate all other sessions except current
    // const currentToken = req.headers.authorization?.split(" ")[1];
    // await Session.deleteMany({ userId: userId, token: { $ne: currentToken } });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Request account deletion (sends verification code)
export const requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete any existing deletion codes for this user
    await Code.deleteMany({ userId: userId, type: "delete" });

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Save verification code
    const code = new Code({
      userId: userId,
      code: verificationCode,
      type: "delete"
    });
    await code.save();

    // Send verification email
    const { sendDeleteAccountEmail } = await import("../utils/sendEmail.js");
    await sendDeleteAccountEmail(user.email, verificationCode, user.name);

    res.status(200).json({ 
      message: "Verification code sent to your email"
    });
  } catch (error) {
    console.error("Error in requestAccountDeletion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify deletion code and delete account
export const verifyAndDeleteAccount = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const userId = req.userId; // From auth middleware

    if (!verificationCode) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the verification code
    const codeRecord = await Code.findOne({
      userId: userId,
      code: verificationCode,
      type: "delete"
    });

    if (!codeRecord) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Delete user's sessions
    await Session.deleteMany({ userId: userId });

    // Delete all verification codes for this user (not just the deletion code)
    await Code.deleteMany({ userId: userId });

    // Delete email revert records for this user
    // await Revert.deleteMany({ userId: userId });

    // Delete all invites sent by this user
    await Invite.deleteMany({ invitedBy: userId });

    // Delete all pending invites for this user (by email or userId)
    await Invite.deleteMany({
      $or: [
        { invitedUserId: userId },
        { invitedEmail: user.email }
      ]
    });

    // Get all projects where user is owner
    const ownedProjects = await Project.find({ ownedBy: userId });
    
    for (const project of ownedProjects) {
      // Check if project has other members
      const otherMembers = project.members.filter(member => member.id.toString() !== userId.toString());
      
      if (otherMembers.length > 0) {
        // Transfer ownership to the first member (first to join)
        const newOwner = otherMembers[0].id;
        project.ownedBy = newOwner;
        
        // Remove the new owner from members array to avoid duplication
        project.members = otherMembers.filter(member => member.id.toString() !== newOwner.toString());
        
        await project.save();
      } else {
        // No other members, delete the entire project and related data
        await Task.deleteMany({ projectId: project._id });
        await Invite.deleteMany({ projectId: project._id });
        await Project.findByIdAndDelete(project._id);
      }
    }

    // Remove user from other projects' members (where they are not owner)
    const projectsWithMember = await Project.find({ "members.id": userId });
    for (const project of projectsWithMember) {
      project.members = project.members.filter(
        (member) => member.id.toString() !== userId.toString()
      );
      await project.save();
    }

    // Remove all comments made by the deleted user from all tasks
    await Task.updateMany(
      { "comments.authorId": userId },
      { $pull: { comments: { authorId: userId } } }
    );

    // Unassign all tasks that were assigned to the deleted user
    await Task.updateMany(
      { assignedTo: userId },
      { $unset: { assignedTo: "" } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in verifyAndDeleteAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};