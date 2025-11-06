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
  getUser
} from "../controllers/userController.js";

import checkPassword from "../middlewares/passwordCheck.js"; 
import tokenGenerator from "../utils/tokenGenerator.js"; 
import authService from "../middlewares/auth.js"; 


const authRouter = express.Router();
authRouter.post("/signup", userRegistration); 
authRouter.post("/verify-email/", verifyEmail, tokenGenerator);
authRouter.post(
  "/verify-email/resend-verification-code/",
  resendVerificationCode
);
authRouter.post("/batch" ,authService, getUsersByIds);
authRouter.post("/login", checkPassword, userLogin, tokenGenerator);
authRouter.post("/logout", userLogout); 
authRouter.post("/reset-password", resetPassword);
authRouter.post("/reset-password/verify", verifyResetCode);
authRouter.post("/reset-password/new", setNewPassword, tokenGenerator);
authRouter.get("/:userId", authService, getUser);

export default authRouter;
