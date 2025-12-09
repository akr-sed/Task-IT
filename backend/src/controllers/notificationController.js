import Log from "../models/log.js";

// GET /api/notifications/me
// Fetch logs where recipient == currentUser (userAssigned)
export async function getMyNotifications(req, res) {
  try {
    console.log('=== GET /api/notifications/me ===');
    const userId = req.userId;
    console.log('User ID from token:', userId);
    
    if (!userId) {
      console.log('ERROR: No userId in request');
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Query params for filtering
    const { unread, page = 1, limit = 20 } = req.query;
    console.log('Query params:', { unread, page, limit });

    const query = { userAssigned: userId };

    // Optional: filter by unread status
    if (unread === "true") {
      query.isRead = false;
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log('Skip:', skip, 'Limit:', parseInt(limit));

    console.log('Executing database query...');
    const [notifications, total] = await Promise.all([
      Log.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userCreated", "name email")
        .populate("projectId", "name")
        .populate("taskId", "title")
        .lean(),
      Log.countDocuments(query),
    ]);

    console.log('Query results:');
    console.log('- Total matching logs:', total);
    console.log('- Notifications returned:', notifications.length);
    if (notifications[0]) {
      console.log('- First notification sample:');
      console.log('  * _id:', notifications[0]._id);
      console.log('  * title:', notifications[0].title);
      console.log('  * userCreated:', notifications[0].userCreated);
      console.log('  * projectId:', notifications[0].projectId);
      console.log('  * taskId:', notifications[0].taskId);
    }

    const response = {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
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
