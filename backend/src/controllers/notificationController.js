import Log from "../models/log.js";

// GET /api/notifications/me
// Fetch logs where recipient == currentUser (userAssigned)
export async function getMyNotifications(req, res) {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Query params for filtering
    const { unread, read, page = 1, limit = 20 } = req.query;
    const query = { userAssigned: userId };

    // Filter by read status
    if (unread === "true") {
      query.isRead = false;
    } else if (read === "true") {
      query.isRead = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unreadTotal] = await Promise.all([
      Log.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userCreated", "name email")
        .populate("projectId", "name")
        .populate("taskId", "title")
        .lean(),
      Log.countDocuments(query),
      Log.countDocuments({ userAssigned: userId, isRead: false }),
    ]);



    const response = {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount: unreadTotal,
    };

    console.log('Sending response with', notifications.length, 'notifications');
    console.log('=== END /api/notifications/me ===\n');
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("ERROR in getMyNotifications:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      message: "Failed to fetch notifications",
      error: error.message 
    });
  }
}

// GET /api/notifications/me/unread-count
// Get count of unread notifications
export async function getUnreadCount(req, res) {
  try {
    console.log('=== GET /api/notifications/me/unread-count ===');
    const userId = req.userId;
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('ERROR: No userId');
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = { userAssigned: userId, isRead: false };
    console.log('Query:', JSON.stringify(query));
    
    const count = await Log.countDocuments(query);
    console.log('Unread count:', count);
    console.log('=== END /api/notifications/me/unread-count ===\n');

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("ERROR in getUnreadCount:", error.message);
    console.error(error.stack);
    return res.status(500).json({ 
      message: "Failed to get unread count",
      error: error.message 
    });
  }
}

// PATCH /api/notifications/:id/read
// Mark a single notification as read
export async function markAsRead(req, res) {
  try {
    console.log('=== PATCH /api/notifications/:id/read ===');
    const userId = req.userId;
    const { id } = req.params;
    console.log('User ID:', userId, 'Notification ID:', id);

    if (!userId) {
      console.log('ERROR: No userId');
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log('Attempting to mark notification as read...');
    const notification = await Log.findOneAndUpdate(
      { _id: id, userAssigned: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      console.log('ERROR: Notification not found or user not authorized');
      return res.status(404).json({ message: "Notification not found" });
    }

    console.log('Successfully marked as read:', id);
    console.log('=== END PATCH /api/notifications/:id/read ===\n');
    return res.status(200).json({ notification });
  } catch (error) {
    console.error("ERROR in markAsRead:", error.message);
    console.error(error.stack);
    return res.status(500).json({ 
      message: "Failed to mark as read",
      error: error.message 
    });
  }
}

// PATCH /api/notifications/me/read-all
// Mark all notifications as read for current user
export async function markAllAsRead(req, res) {
  try {
    console.log('=== PATCH /api/notifications/me/read-all ===');
    const userId = req.userId;
    console.log('User ID:', userId);

    if (!userId) {
      console.log('ERROR: No userId');
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log('Marking all notifications as read...');
    const result = await Log.updateMany(
      { userAssigned: userId, isRead: false },
      { isRead: true }
    );

    console.log('Modified count:', result.modifiedCount);
    console.log('=== END PATCH /api/notifications/me/read-all ===\n');

    return res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("ERROR in markAllAsRead:", error.message);
    console.error(error.stack);
    return res.status(500).json({ 
      message: "Failed to mark all as read",
      error: error.message 
    });
  }
}

// DELETE /api/notifications/:id
// Delete a single notification
export async function deleteNotification(req, res) {
  try {
    console.log('=== DELETE /api/notifications/:id ===');
    const userId = req.userId;
    const { id } = req.params;
    console.log('User ID:', userId, 'Notification ID:', id);

    if (!userId) {
      console.log('ERROR: No userId');
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only allow users to delete their own notifications
    const notification = await Log.findOneAndDelete({
      _id: id,
      userAssigned: userId,
    });

    if (!notification) {
      console.log('ERROR: Notification not found or user not authorized');
      return res.status(404).json({ message: "Notification not found" });
    }

    console.log('Successfully deleted notification:', id);
    console.log('=== END DELETE /api/notifications/:id ===\n');
    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("ERROR in deleteNotification:", error.message);
    console.error(error.stack);
    return res.status(500).json({ 
      message: "Failed to delete notification",
      error: error.message 
    });
  }
}

// DELETE /api/notifications/me/all
// Delete all notifications for current user
export async function deleteAllNotifications(req, res) {
  try {
    console.log('=== DELETE /api/notifications/me/all ===');
    const userId = req.userId;
    console.log('User ID:', userId);

    if (!userId) {
      console.log('ERROR: No userId');
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log('Deleting all notifications for user...');
    const result = await Log.deleteMany({ userAssigned: userId });

    console.log('Deleted count:', result.deletedCount);
    console.log('=== END DELETE /api/notifications/me/all ===\n');

    return res.status(200).json({
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("ERROR in deleteAllNotifications:", error.message);
    console.error(error.stack);
    return res.status(500).json({ 
      message: "Failed to delete all notifications",
      error: error.message 
    });
  }
}

// DELETE /api/notifications/me/read
// Delete all read notifications for current user
export async function deleteReadNotifications(req, res) {
  try {
    console.log('=== DELETE /api/notifications/me/read ===');
    const userId = req.userId;
    console.log('User ID:', userId);

    if (!userId) {
      console.log('ERROR: No userId');
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log('Deleting all read notifications for user...');
    const result = await Log.deleteMany({ userAssigned: userId, isRead: true });

    console.log('Deleted count:', result.deletedCount);
    console.log('=== END DELETE /api/notifications/me/read ===\n');

    return res.status(200).json({
      message: "All read notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("ERROR in deleteReadNotifications:", error.message);
    console.error(error.stack);
    return res.status(500).json({ 
      message: "Failed to delete read notifications",
      error: error.message 
    });
  }
}
