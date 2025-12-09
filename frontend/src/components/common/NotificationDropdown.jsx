import React, { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { Bell, User, FolderKanban, CheckCircle2, AlertCircle, MessageCircle, UserPlus, UserMinus, Crown, Edit, Trash2, ExternalLink, X } from 'lucide-react';
import { notificationService } from '../../api';
import { onNotification, getSocket, emitLocal, onLocal } from '../../api/socketService';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { useNavigate, Link } from 'react-router-dom';

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

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const hasLoadedRef = useRef(false);
  const navigate = useNavigate();

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Subscribe to new notifications
    const unsubscribe = onNotification((notification) => {
      // Add to notifications list (newest first)
      setNotifications(prev => [notification, ...prev].slice(0, 10));
      // Increment unread count
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch notifications when dropdown opens for the first time
  useEffect(() => {
    if (isOpen && !hasLoadedRef.current) {
      fetchNotifications();
      hasLoadedRef.current = true;
    }
  }, [isOpen]);

  // Listen for local events from other components (e.g., NotificationsPage)
  useEffect(() => {
    // When a notification is deleted elsewhere
    const unsubDelete = onLocal("notification:deleted", ({ id, wasUnread }) => {
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    // When a notification is marked as read elsewhere
    const unsubRead = onLocal("notification:read", ({ id }) => {
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    // When all notifications are marked as read elsewhere
    const unsubAllRead = onLocal("notification:allRead", () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    // When all notifications are deleted elsewhere
    const unsubAllDeleted = onLocal("notification:allDeleted", () => {
      setNotifications([]);
      setUnreadCount(0);
    });

    return () => {
      unsubDelete();
      unsubRead();
      unsubAllRead();
      unsubAllDeleted();
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications({ limit: 10 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    hasLoadedRef.current = false;
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    hasLoadedRef.current = true;
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // Use the link field if available (new system)
    if (notification.link) {
      navigate(notification.link);
      return;
    }

    // Fallback: Generate link based on type (for backwards compatibility)
    const projectId = typeof notification.projectId === 'object' 
      ? notification.projectId?._id 
      : notification.projectId;
    
    const taskId = typeof notification.taskId === 'object'
      ? notification.taskId?._id
      : notification.taskId;

    // Navigate based on notification type
    const type = notification.type || 'GENERAL';
    
    switch (type) {
      case 'TASK_CREATED':
        if (projectId) navigate(`/projects/${projectId}?tab=tasks`);
        break;
      case 'TASK_ASSIGNED':
        if (projectId && taskId) {
          navigate(`/projects/${projectId}/tasks/${taskId}`);
        } else if (projectId) {
          navigate(`/projects/${projectId}?tab=assignment`);
        }
        break;
      case 'TASK_STATUS_CHANGED':
      case 'TASK_EDITED':
      case 'TASK_COMMENT':
        if (projectId && taskId) {
          navigate(`/projects/${projectId}/tasks/${taskId}`);
        } else if (projectId) {
          navigate(`/projects/${projectId}?tab=tasks`);
        }
        break;
      case 'TASK_DELETED':
        if (projectId) navigate(`/projects/${projectId}?tab=tasks`);
        break;
      case 'PROJECT_INVITE_SENT':
      case 'PROJECT_EDITED':
        if (projectId) navigate(`/projects/${projectId}?tab=overview`);
        break;
      case 'PROJECT_INVITE_ACCEPTED':
      case 'PROJECT_INVITE_DECLINED':
      case 'PROJECT_MEMBER_REMOVED':
      case 'PROJECT_ROLE_UPDATED':
      case 'PROJECT_OWNERSHIP_TRANSFERRED':
        if (projectId) navigate(`/projects/${projectId}?tab=members`);
        break;
      case 'PROJECT_DELETED':
        navigate('/projects');
        break;
      default:
        if (projectId) navigate(`/projects/${projectId}`);
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      setUnreadCount(0);
      
      // Emit local event for cross-component sync
      emitLocal("notification:allRead", {});
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleting(notificationId);
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Check if it was unread
      const wasUnread = notifications.find(n => n._id === notificationId)?.isRead === false;
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if needed
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Emit local event for cross-component sync
      emitLocal("notification:deleted", { id: notificationId, wasUnread });
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-3 h-3" />;
      case 'medium':
        return <AlertCircle className="w-3 h-3" />;
      case 'low':
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return <CheckCircle2 className="w-3 h-3" />;
    }
  };

  const getNotificationIcon = (notification) => {
    // Use type-based icons (new system)
    const type = notification.type || 'GENERAL';
    const IconComponent = NOTIFICATION_ICONS[type];
    
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }

    // Fallback for old notifications without type
    if (notification.taskId) {
      return <CheckCircle2 className="w-4 h-4" />;
    }
    if (notification.projectId) {
      return <FolderKanban className="w-4 h-4" />;
    }
    if (notification.userCreated) {
      return <User className="w-4 h-4" />;
    }
    return <Bell className="w-4 h-4" />;
  };

  const formatNotificationTitle = (notification) => {
    // The new notification system sends well-formatted titles directly
    // Just return the title as-is since it's now human-readable from backend
    return notification.title;
  };

  /**
   * Get color scheme based on notification type
   */
  const getTypeColor = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'PROJECT_INVITE_SENT':
        return 'bg-blue-100 text-blue-600';
      case 'TASK_STATUS_CHANGED':
        return 'bg-green-100 text-green-600';
      case 'TASK_COMMENT':
        return 'bg-purple-100 text-purple-600';
      case 'TASK_DELETED':
      case 'PROJECT_DELETED':
      case 'PROJECT_MEMBER_REMOVED':
        return 'bg-red-100 text-red-600';
      case 'PROJECT_OWNERSHIP_TRANSFERRED':
      case 'PROJECT_ROLE_UPDATED':
        return 'bg-yellow-100 text-yellow-600';
      case 'PROJECT_INVITE_ACCEPTED':
        return 'bg-green-100 text-green-600';
      case 'PROJECT_INVITE_DECLINED':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Menu as="div" className="relative">
      {({ open }) => {
        // Update state when menu opens/closes
        if (open !== isOpen) {
          setTimeout(() => setIsOpen(open), 0);
        }

        return (
          <>
            <MenuButton
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </MenuButton>

          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50 max-h-[32rem] flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <MenuItem key={notification._id}>
                        {({ active }) => (
                          <div
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              active ? 'bg-gray-50' : ''
                            } ${!notification.isRead ? 'bg-blue-50/30 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon based on notification type */}
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
                                {getNotificationIcon(notification)}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Title with unread indicator and delete button */}
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                                    {formatNotificationTitle(notification)}
                                  </h4>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {!notification.isRead && (
                                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                    )}
                                    <button
                                      onClick={(e) => handleDeleteNotification(e, notification._id)}
                                      disabled={deleting === notification._id}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Delete notification"
                                    >
                                      <X className={`w-3.5 h-3.5 ${deleting === notification._id ? 'animate-pulse' : ''}`} />
                                    </button>
                                  </div>
                                </div>

                                {/* Content */}
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                  {notification.content}
                                </p>

                                {/* Metadata section */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Priority badge */}
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${getPriorityColor(
                                      notification.priority
                                    )}`}
                                  >
                                    {getPriorityIcon(notification.priority)}
                                    {notification.priority}
                                  </span>

                                  {/* Project name if available */}
                                  {notification.projectId && typeof notification.projectId === 'object' && notification.projectId.name && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                      <FolderKanban className="w-3 h-3" />
                                      {notification.projectId.name}
                                    </span>
                                  )}

                                  {/* Task title if available */}
                                  {notification.taskId && typeof notification.taskId === 'object' && notification.taskId.title && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
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
                        )}
                      </MenuItem>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-4">
                {notifications.length > 0 && (
                  <button
                    onClick={handleRefresh}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Refresh
                  </button>
                )}
                <Link
                  to="/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-auto"
                >
                  View all
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </MenuItems>
          </Transition>
        </>
        );
      }}
    </Menu>
  );
};

export default NotificationDropdown;
