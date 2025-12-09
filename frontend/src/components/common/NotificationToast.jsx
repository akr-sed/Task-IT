import React, { useState, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { Bell, X, CheckCircle2, UserPlus, UserMinus, Crown, Edit, Trash2, MessageCircle } from 'lucide-react';

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

/**
 * Get color scheme based on notification type
 */
const getTypeColor = (type) => {
  switch (type) {
    case 'TASK_ASSIGNED':
    case 'PROJECT_INVITE_SENT':
      return 'bg-blue-500';
    case 'TASK_STATUS_CHANGED':
    case 'PROJECT_INVITE_ACCEPTED':
      return 'bg-green-500';
    case 'TASK_COMMENT':
      return 'bg-purple-500';
    case 'TASK_DELETED':
    case 'PROJECT_DELETED':
    case 'PROJECT_MEMBER_REMOVED':
      return 'bg-red-500';
    case 'PROJECT_OWNERSHIP_TRANSFERRED':
    case 'PROJECT_ROLE_UPDATED':
      return 'bg-yellow-500';
    case 'PROJECT_INVITE_DECLINED':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Single Toast Item Component
 */
const ToastItem = ({ notification, onClose, onClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const type = notification.type || 'GENERAL';
  const IconComponent = NOTIFICATION_ICONS[type] || Bell;

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClick(notification);
      onClose();
    }, 150);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <Transition
      as={Fragment}
      show={isVisible}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        onClick={handleClick}
        className="max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(type)}`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                {notification.title}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                {notification.content}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        <div className="h-1 bg-gray-100">
          <div 
            className={`h-full ${getTypeColor(type)} animate-shrink-width`}
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>
    </Transition>
  );
};

/**
 * Toast Container - manages multiple toasts
 */
const NotificationToast = ({ toasts, onRemove, onToastClick }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((notification) => (
          <ToastItem
            key={notification._id || notification.id}
            notification={notification}
            onClose={() => onRemove(notification._id || notification.id)}
            onClick={onToastClick}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationToast;
