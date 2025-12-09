import express from "express";
import auth from "../middlewares/auth.js";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get notifications for the authenticated user (supports pagination and unread filter)
router.get("/me", auth, getMyNotifications);

// Get unread notification count
router.get("/me/unread-count", auth, getUnreadCount);

// Mark a single notification as read
router.patch("/:id/read", auth, markAsRead);

// Mark all notifications as read
router.patch("/me/read-all", auth, markAllAsRead);

export default router;
