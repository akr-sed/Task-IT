// authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Session from "../models/session.js";

export default async function authService(req, res, next) {
  try {
    // Check for token in headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify token
    const secretKey = process.env.SECRET;
    if (!secretKey) {
        console.error("FATAL: SECRET environment variable is not defined");
        return res.status(500).json({ error: "Server configuration error" });
    }
    const decoded = jwt.verify(token, secretKey);


    // Find the session
    const session = await Session.findOne({
      token: token,
      userId: decoded.userId,
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Add user info to request
    req.userId = decoded.userId;
    req.user = user;
    req.session = session;

    // Update last accessed time for the session
    session.lastUpdated = Date.now();
    await session.save();

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
