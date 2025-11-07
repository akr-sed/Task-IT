// password.js
import bcrypt from "bcrypt";
import User from "../models/user.js";

export default async function checkPassword(req, res, next) {
  let user = req.user; // if called after auth middleware

  if (!user) {
    user = await User.findOne({ email: req.body.email });
  }

  if (!user) {
    return res.status(403).json({ error: "User not found" });
  }

  if (!req.body.password) {
    return res.status(401).json({ error: "Please provide a password" });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ error: "Invalid password" });
  }
  
  req.user = user;
  req.userId = user._id;

  next();
}
