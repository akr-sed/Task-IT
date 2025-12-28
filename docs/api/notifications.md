# 🔔 Notifications API

Base URL: `/api/notifications`

## Overview

The Notifications API manages in-app notifications for the authenticated user. Notifications are created automatically by the system when events occur (task assignments, project updates, etc.) and delivered in real-time via Socket.IO.

---

## Endpoints

### Get My Notifications

#### `GET /me`

Fetch notifications for the authenticated user with pagination and filtering.

**Authorization:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 20 | Number of notifications per page |
| unread | boolean | - | Filter to show only unread notifications |
| read | boolean | - | Filter to show only read notifications |

**Examples:**
```
GET /api/notifications/me
GET /api/notifications/me?page=2&limit=10
GET /api/notifications/me?unread=true
GET /api/notifications/me?read=true&limit=50
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439051",
      "title": "Task Assigned to You",
      "content": "John Doe assigned you to task 'Implement login page'",
      "type": "TASK_ASSIGNED",
      "priority": "high",
      "isRead": false,
      "link": "/projects/507f1f77bcf86cd799439011/tasks/507f1f77bcf86cd799439031",
      "createdAt": "2024-12-25T14:30:00.000Z",
      "userCreated": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "projectId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Project Alpha"
      },
      "taskId": {
        "_id": "507f1f77bcf86cd799439031",
        "title": "Implement login page"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  },
  "unreadCount": 12
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | "Unauthorized" |
| 500 | "Failed to fetch notifications" |

---

### Get Unread Count

#### `GET /me/unread-count`

Get the count of unread notifications for badge display.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "unreadCount": 12
}
```

**Use Case:** 
This endpoint is called frequently to update the notification badge in the UI without fetching all notifications.

---

### Mark as Read

#### `PATCH /:id/read`

Mark a single notification as read.

**Authorization:** Required (Bearer Token)

**URL Parameters:**
| Parameter | Description |
|-----------|-------------|
| id | Notification ID |

**Response (200 OK):**
```json
{
  "notification": {
    "_id": "507f1f77bcf86cd799439051",
    "title": "Task Assigned to You",
    "content": "John Doe assigned you to task 'Implement login page'",
    "isRead": true,
    "createdAt": "2024-12-25T14:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | "Unauthorized" |
| 404 | "Notification not found" |
| 500 | "Failed to mark as read" |

---

### Mark All as Read

#### `PATCH /me/read-all`

Mark all notifications as read for the current user.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read",
  "modifiedCount": 12
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | "Unauthorized" |
| 500 | "Failed to mark all as read" |

---

### Delete Notification

#### `DELETE /:id`

Delete a single notification.

**Authorization:** Required (Bearer Token)

**URL Parameters:**
| Parameter | Description |
|-----------|-------------|
| id | Notification ID |

**Response (200 OK):**
```json
{
  "message": "Notification deleted successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | "Unauthorized" |
| 404 | "Notification not found" |
| 500 | "Failed to delete notification" |

---

### Delete All Notifications

#### `DELETE /me/all`

Delete all notifications for the current user.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "message": "All notifications deleted",
  "deletedCount": 45
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | "Unauthorized" |
| 500 | "Failed to delete all notifications" |

---

### Delete Read Notifications

#### `DELETE /me/read`

Delete only read notifications for the current user.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "message": "Read notifications deleted",
  "deletedCount": 33
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | "Unauthorized" |
| 500 | "Failed to delete read notifications" |

---

## Notification Types

| Type | Description | Priority |
|------|-------------|----------|
| `TASK_CREATED` | New task created in a project | medium |
| `TASK_ASSIGNED` | Task assigned to the user | high |
| `TASK_STATUS_CHANGED` | Task status was updated | low |
| `TASK_EDITED` | Task details were modified | low |
| `TASK_DELETED` | Task was deleted | high |
| `TASK_COMMENT` | New comment on a task | medium |
| `PROJECT_INVITE_SENT` | Invitation to join a project | high |
| `PROJECT_INVITE_ACCEPTED` | User accepted project invitation | medium |
| `PROJECT_INVITE_DECLINED` | User declined project invitation | low |
| `PROJECT_MEMBER_REMOVED` | User was removed from project | high |
| `PROJECT_ROLE_UPDATED` | User's role was changed | medium |
| `PROJECT_OWNERSHIP_TRANSFERRED` | Project ownership changed | high |
| `PROJECT_EDITED` | Project details were updated | low |
| `PROJECT_DELETED` | Project was deleted | high |
| `GENERAL` | General notification | medium |

---

## Real-time Notifications (Socket.IO)

Notifications are also delivered in real-time via WebSocket.

### Connection Setup

```javascript
import { io } from 'socket.io-client';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  withCredentials: true
});

// Join user's room after connection
socket.on('connect', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  socket.emit('user:join', user.id);
});
```

### Listening for Notifications

```javascript
// Subscribe to new notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  
  // Update UI (show toast, update badge, etc.)
  showToast(notification);
  updateBadgeCount(prev => prev + 1);
});
```

### Notification Event Payload

```json
{
  "_id": "507f1f77bcf86cd799439051",
  "title": "Task Assigned to You",
  "content": "John Doe assigned you to task 'Implement login page'",
  "type": "TASK_ASSIGNED",
  "priority": "high",
  "isRead": false,
  "link": "/projects/507f1f77bcf86cd799439011",
  "createdAt": "2024-12-25T14:30:00.000Z",
  "userCreated": "507f1f77bcf86cd799439001",
  "projectId": "507f1f77bcf86cd799439011",
  "taskId": "507f1f77bcf86cd799439031"
}
```

---

## Notification Priority Levels

| Priority | Description | UI Treatment |
|----------|-------------|--------------|
| high | Critical notifications requiring attention | Bold styling, prominent display |
| medium | Important but not urgent | Normal styling |
| low | Informational only | Subtle styling |

---

## Notification Links

Notifications include a `link` field for navigation:

| Type | Link Format |
|------|-------------|
| Task-related | `/projects/{projectId}` |
| Project invitation | `/projects/{projectId}/invite/{inviteId}/{code}` |
| Project-related | `/projects/{projectId}` |

---

## Frontend Integration

### Notification Service

```javascript
import api from './axiosInstance';

const notificationService = {
  getMyNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/notifications/me?${queryParams}`);
  },
  
  getUnreadCount: async () => {
    return api.get('/notifications/me/unread-count');
  },
  
  markAsRead: async (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },
  
  markAllAsRead: async () => {
    return api.patch('/notifications/me/read-all');
  },
  
  deleteNotification: async (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },
  
  deleteAllNotifications: async () => {
    return api.delete('/notifications/me/all');
  },
  
  deleteReadNotifications: async () => {
    return api.delete('/notifications/me/read');
  }
};
```

### Socket Service

```javascript
let socket = null;

export function initializeSocket() {
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true
  });
  
  socket.on('connect', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      socket.emit('user:join', user.id);
    }
  });
  
  return socket;
}

export function onNotification(callback) {
  if (socket) {
    socket.on('notification', callback);
    return () => socket.off('notification', callback);
  }
  return () => {};
}
```

---

*Last Updated: December 2025*
