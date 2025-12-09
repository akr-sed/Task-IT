import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  UserPlus,
  UserMinus,
  Crown,
  Edit,
  Trash2,
  MessageCircle,
  FolderKanban,
  AlertCircle,
  RefreshCw,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { notificationService } from "../api";
import { onNotification, emitLocal, onLocal } from "../api/socketService";
import { formatDistanceToNow } from "../utils/dateUtils";

/**
 * Notification type to icon mapping
 */
const NOTIFICATION_ICONS = {
  TASK_CREATED: CheckCircle2,
  TASK_ASSIGNED: UserPlus,
  TASK_STATUS_CHANGED: CheckCircle2,
  TASK_EDITED: Edit,
  TASK_DELETED: Trash2,
  TASK_COMMENT: MessageCircle,
  PROJECT_INVITE_SENT: UserPlus,
  PROJECT_INVITE_ACCEPTED: UserPlus,
  PROJECT_INVITE_DECLINED: UserMinus,
  PROJECT_MEMBER_REMOVED: UserMinus,
  PROJECT_ROLE_UPDATED: Crown,
  PROJECT_OWNERSHIP_TRANSFERRED: Crown,
  PROJECT_EDITED: Edit,
  PROJECT_DELETED: Trash2,
  GENERAL: Bell,
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "unread", "read"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      
      // Add read filter based on selection
      if (filter === "unread") {
        params.read = false;
      } else if (filter === "read") {
        params.read = true;
      }

      const response = await notificationService.getMyNotifications(params);
      setNotifications(response.data.notifications);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalCount(response.data.pagination?.totalCount || response.data.notifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    const unsubscribe = onNotification((notification) => {
      // Only add to list if we're on the first page and showing "all" or "unread"
      if (page === 1 && filter !== "read") {
        setNotifications(prev => [notification, ...prev].slice(0, 15));
        setTotalCount(prev => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [page, filter]);

  // Listen for local events from other components (e.g., NotificationDropdown)
  useEffect(() => {
    // When a notification is deleted elsewhere
    const unsubDelete = onLocal("notification:deleted", ({ id }) => {
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
    });

    // When a notification is marked as read elsewhere
    const unsubRead = onLocal("notification:read", ({ id }) => {
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    });

    // When all notifications are marked as read elsewhere
    const unsubAllRead = onLocal("notification:allRead", () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    });

    // When all notifications are deleted elsewhere
    const unsubAllDeleted = onLocal("notification:allDeleted", () => {
      setNotifications([]);
      setTotalCount(0);
      setTotalPages(1);
      setPage(1);
    });

    return () => {
      unsubDelete();
      unsubRead();
      unsubAllRead();
      unsubAllDeleted();
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    // Navigate to the notification link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      // Emit local event for cross-component sync
      emitLocal("notification:read", { id: notificationId });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      // Emit local event for cross-component sync
      emitLocal("notification:allRead", {});
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    setDeleting(notificationId);
    try {
      // Check if it was unread before deleting
      const wasUnread = notifications.find(n => n._id === notificationId)?.isRead === false;
      
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setTotalCount((prev) => prev - 1);
      
      // Emit local event for cross-component sync
      emitLocal("notification:deleted", { id: notificationId, wasUnread });
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications? This action cannot be undone.")) {
      return;
    }
    
    setDeletingAll(true);
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setTotalCount(0);
      setTotalPages(1);
      setPage(1);
      
      // Emit local event for cross-component sync
      emitLocal("notification:allDeleted", {});
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    } finally {
      setDeletingAll(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "TASK_ASSIGNED":
      case "PROJECT_INVITE_SENT":
        return "bg-blue-100 text-blue-600";
      case "TASK_STATUS_CHANGED":
        return "bg-green-100 text-green-600";
      case "TASK_COMMENT":
        return "bg-purple-100 text-purple-600";
      case "TASK_DELETED":
      case "PROJECT_DELETED":
      case "PROJECT_MEMBER_REMOVED":
        return "bg-red-100 text-red-600";
      case "PROJECT_OWNERSHIP_TRANSFERRED":
      case "PROJECT_ROLE_UPDATED":
        return "bg-yellow-100 text-yellow-600";
      case "PROJECT_INVITE_ACCEPTED":
        return "bg-green-100 text-green-600";
      case "PROJECT_INVITE_DECLINED":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getNotificationIcon = (notification) => {
    const type = notification.type || "GENERAL";
    const IconComponent = NOTIFICATION_ICONS[type];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Bell className="w-5 h-5" />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-3 h-3" />;
      case "medium":
        return <AlertCircle className="w-3 h-3" />;
      case "low":
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return <CheckCircle2 className="w-3 h-3" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            {totalCount} notification{totalCount !== 1 ? "s" : ""}
            {filter === "all" && unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Trash2 className={`w-4 h-4 ${deletingAll ? "animate-pulse" : ""}`} />
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "read", label: "Read" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E31B54]"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Bell className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "unread"
                ? "You've read all your notifications!"
                : filter === "read"
                ? "No read notifications yet"
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-5 cursor-pointer transition-all hover:bg-gray-50 ${
                  !notification.isRead
                    ? "bg-blue-50/40 border-l-4 border-[#E31B54]"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notification._id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification._id)}
                          disabled={deleting === notification._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete notification"
                        >
                          <Trash2
                            className={`w-4 h-4 ${
                              deleting === notification._id ? "animate-pulse" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {notification.content}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(
                          notification.priority
                        )}`}
                      >
                        {getPriorityIcon(notification.priority)}
                        {notification.priority}
                      </span>

                      {/* Project name */}
                      {notification.projectId &&
                        typeof notification.projectId === "object" &&
                        notification.projectId.name && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            <FolderKanban className="w-3 h-3" />
                            {notification.projectId.name}
                          </span>
                        )}

                      {/* Task title */}
                      {notification.taskId &&
                        typeof notification.taskId === "object" &&
                        notification.taskId.title && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {notification.taskId.title}
                          </span>
                        )}

                      {/* Time ago */}
                      <span className="text-xs text-gray-500 ml-auto">
                        {formatDistanceToNow(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
