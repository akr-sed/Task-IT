import express from "express";
import {
  userRegistration,
  verifyEmail,
  resendVerificationCode,
  userLogin,
  userLogout,
  resetPassword,
  verifyResetCode,
  setNewPassword,
  getUsersByIds,
  getUser,
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  requestAccountDeletion,
  verifyAndDeleteAccount
} from "../controllers/userController.js";

import checkPassword from "../middlewares/passwordCheck.js"; // checks the password
import tokenGenerator from "../utils/tokenGenerator.js"; // automatic generate a session
import authService from "../middlewares/auth.js"; // get user info based on token
import {
  validateSignup,
  validateLogin,
  validateEmailVerification,
  validatePasswordResetRequest,
  validateResetCodeVerification,
  validateSetNewPassword,
  validateChangePassword,
  validateProfileUpdate,
  validateEmailChangeRequest,
  validateEmailChangeVerification,
  validateAccountDeletion,
  handleValidationErrors,
} from "../middlewares/inputValidation.js";
import {
  loginLimiter,
  signupLimiter,
  passwordResetRequestLimiter,
  passwordResetVerifyLimiter,
  emailVerificationLimiter,
  passwordChangeLimiter,
  emailChangeLimiter,
} from "../middlewares/rateLimiter.js";

const authRouter = express.Router();

// Authentication routes
authRouter.post("/signup", signupLimiter, validateSignup, handleValidationErrors, userRegistration);
authRouter.post("/verify-email/", emailVerificationLimiter, validateEmailVerification, handleValidationErrors, verifyEmail, tokenGenerator);
authRouter.post("/verify-email/resend-verification-code/", emailVerificationLimiter, validatePasswordResetRequest, handleValidationErrors, resendVerificationCode);
authRouter.post("/login", loginLimiter, validateLogin, handleValidationErrors, checkPassword, userLogin, tokenGenerator);
authRouter.post("/logout", userLogout);

// Password management routes
authRouter.post("/reset-password", passwordResetRequestLimiter, validatePasswordResetRequest, handleValidationErrors, resetPassword);
authRouter.post("/reset-password/verify", passwordResetVerifyLimiter, validateResetCodeVerification, handleValidationErrors, verifyResetCode);
authRouter.post("/reset-password/new", passwordResetVerifyLimiter, validateSetNewPassword, handleValidationErrors, setNewPassword , tokenGenerator);
authRouter.post("/change-password", authService, passwordChangeLimiter, validateChangePassword, handleValidationErrors, changePassword);

// User profile routes (require authentication)
authRouter.get("/:userId", authService, getUser);
authRouter.post("/batch", authService, getUsersByIds);
authRouter.put("/profile", authService, updateProfile);

// Email change routes (require authentication)
authRouter.post("/email/request-change", authService, emailChangeLimiter, requestEmailChange);
authRouter.post("/email/verify-change", authService, emailVerificationLimiter, verifyEmailChange);

// Account deletion routes (require authentication)
authRouter.post("/account/request-deletion", authService, requestAccountDeletion);
authRouter.post("/account/verify-deletion", authService, verifyAndDeleteAccount);

export default authRouter;
