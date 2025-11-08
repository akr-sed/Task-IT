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


// User Registration
export const userRegistration = async (req, res) => {
};

// Email Verification
export const verifyEmail = async (req, res, next) => {
};

// Resend Verification Code
export const resendVerificationCode = async (req, res) => {
};

// User Login
export const userLogin = async (req, res, next) => {
};

// User Logout
export const userLogout = async (req, res) => {
};

// Password Reset Request
export const resetPassword = async (req, res) => {
};

// Verify Password Reset Code
export const verifyResetCode = async (req, res) => {
};

// Set New Password
export const setNewPassword = async (req, res, next) => {
};

// Get Users by IDs (Batch)
export const getUsersByIds = async (req, res) => {
};

// Get Single User by ID
export const getUser = async (req, res) => {
};
