import express from "express";
import {
  userRegistration,
  userLogin,
  userLogout,

} from "../controllers/userController.js";

import checkPassword from "../middlewares/passwordCheck.js"; 
import tokenGenerator from "../utils/tokenGenerator.js"; 

const authRouter = express.Router();
authRouter.post("/signup", userRegistration); 
authRouter.post("/login", checkPassword, userLogin, tokenGenerator);
authRouter.post("/logout", userLogout); 

export default authRouter;
