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

import checkPassword from "../middlewares/passwordCheck.js"; // checks the password
import tokenGenerator from "../utils/tokenGenerator.js"; // automatic generate a session
import authService from "../middlewares/auth.js"; // get user info based on token
const authRouter = express.Router();
authRouter.post("/signup", userRegistration); // get user info based on token
authRouter.post("/verify-email/", verifyEmail, tokenGenerator);
authRouter.post(
  "/verify-email/resend-verification-code/",
  resendVerificationCode
);
authRouter.post("/batch" ,authService, getUsersByIds);
authRouter.post("/login", checkPassword, userLogin, tokenGenerator);
authRouter.post("/logout", userLogout); // todo: CHANGE THIS TO DELETE
authRouter.post("/reset-password", resetPassword);
authRouter.post("/reset-password/verify", verifyResetCode);
authRouter.post("/reset-password/new", setNewPassword, tokenGenerator);
authRouter.get("/:userId", authService, getUser);

export default authRouter;

