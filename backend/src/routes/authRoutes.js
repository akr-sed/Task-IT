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
const authRouter = express.Router();

// Authentication routes
authRouter.post("/signup", userRegistration);
authRouter.post("/verify-email/", verifyEmail, tokenGenerator);
authRouter.post("/verify-email/resend-verification-code/", resendVerificationCode);
authRouter.post("/login", checkPassword, userLogin, tokenGenerator);
authRouter.post("/logout", userLogout);

// Password management routes
authRouter.post("/reset-password", resetPassword);
authRouter.post("/reset-password/verify", verifyResetCode);
authRouter.post("/reset-password/new", setNewPassword , tokenGenerator);
authRouter.post("/change-password", authService, changePassword);

// User profile routes (require authentication)
authRouter.get("/:userId", authService, getUser);
authRouter.post("/batch", authService, getUsersByIds);
authRouter.put("/profile", authService, updateProfile);

// Email change routes (require authentication)
authRouter.post("/email/request-change", authService, requestEmailChange);
authRouter.post("/email/verify-change", authService, verifyEmailChange);

// Account deletion routes (require authentication)
authRouter.post("/account/request-deletion", authService, requestAccountDeletion);
authRouter.post("/account/verify-deletion", authService, verifyAndDeleteAccount);

export default authRouter;
