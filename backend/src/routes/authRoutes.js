import express from "express";

// Controllers
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
    getUser
} from "../controllers/userController.js";

// Middlewares & Utilities
import checkPassword from "../middlewares/passwordCheck.js";
import tokenGenerator from "../utils/tokenGenerator.js";
import authService from "../middlewares/auth.js";

const authRouter = express.Router();

// User Registration & Email Verification
authRouter.post("/signup", userRegistration);
authRouter.post("/verify-email/", verifyEmail, tokenGenerator);
authRouter.post(
    "/verify-email/resend-verification-code/",
    resendVerificationCode
);

// User Login & Logout
authRouter.post("/login", checkPassword, userLogin, tokenGenerator);
authRouter.post("/logout", userLogout);

// Password Reset Flow
authRouter.post("/reset-password", resetPassword);
authRouter.post("/reset-password/verify", verifyResetCode);
authRouter.post("/reset-password/new", setNewPassword, tokenGenerator);

// User Data Retrieval (Protected)
authRouter.post("/batch", authService, getUsersByIds);
authRouter.get("/:userId", authService, getUser);

export default authRouter;
