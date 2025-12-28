# ✅ Tasks API

Base URL: `/api/tasks`

## Overview

The Tasks API handles task creation, management, assignment, status updates, and comments within projects.

---

## Endpoints

### Get My Tasks

#### `GET /`

Get all tasks assigned to the authenticated user across all projects.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "projectId": "507f1f77bcf86cd799439011",
      "title": "Implement login page",
      "description": "Create the login form with validation",
      "assignedTo": "507f1f77bcf86cd799439001",
      "status": "in progress",
      "priority": "high",
      "dueDate": "2024-12-30T00:00:00.000Z",
      "createdAt": "2024-12-25T10:30:00.000Z"
    }
  ]
}
```

---

### Get All Projects Tasks

#### `GET /all-projects`

Get all tasks from all projects the authenticated user belongs to.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "projectId": "507f1f77bcf86cd799439011",
      "title": "Implement login page",
      "description": "Create the login form",
      "assignedTo": "507f1f77bcf86cd799439001",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2024-12-30T00:00:00.000Z",
      "comments": [],
      "createdAt": "2024-12-25T10:30:00.000Z"
    }
  ]
}
```

---

### Get Project Tasks

#### `GET /:projectId`

Get all tasks for a specific project.

**Authorization:** Required (Bearer Token)

**Permissions:** Member, Admin, or Owner

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "projectId": "507f1f77bcf86cd799439011",
      "activity": "Development",
      "title": "Implement login page",
      "description": "Create the login form with validation",
      "assignedTo": "507f1f77bcf86cd799439001",
      "status": "todo",
      "priority": "high",
      "dueDate": "2024-12-30T00:00:00.000Z",
      "comments": [
        {
          "_id": "507f1f77bcf86cd799439041",
          "authorId": "507f1f77bcf86cd799439002",
          "text": "Started working on this",
          "createdAt": "2024-12-26T10:00:00.000Z"
        }
      ],
      "createdAt": "2024-12-25T10:30:00.000Z"
    }
  ]
}
```

---

### Get Task by ID

#### `GET /:projectId/:taskId`

Get detailed information about a specific task.

**Authorization:** Required (Bearer Token)

**Permissions:** Member, Admin, or Owner

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "projectId": "507f1f77bcf86cd799439011",
  "activity": "Development",
  "title": "Implement login page",
  "description": "Create the login form with validation",
  "assignedTo": "507f1f77bcf86cd799439001",
  "status": "in progress",
  "priority": "high",
  "dueDate": "2024-12-30T00:00:00.000Z",
  "comments": [],
  "createdAt": "2024-12-25T10:30:00.000Z"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "you are not a member of this project" |
| 404 | "Task not found" |

---

### Create Task

#### `POST /`

Create a new task in a project.

**Authorization:** Required (Bearer Token)

**Permissions:** Admin or Owner (Level 2+)

**Request Body:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "title": "Implement login page",
  "description": "Create the login form with validation",
  "activity": "Development",
  "assignedTo": "507f1f77bcf86cd799439001",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-12-30T00:00:00.000Z"
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| projectId | Required, valid project ID |
| title | Required, unique within project |
| description | Optional |
| activity | Optional |
| assignedTo | Optional, must be project member |
| status | Optional, enum: todo, in progress, done, to review |
| priority | Optional, enum: low, medium, high (default: medium) |
| dueDate | Optional, valid date |

**Response (201 Created):**
```json
{
  "message": "task created successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439031",
    "projectId": "507f1f77bcf86cd799439011",
    "title": "Implement login page",
    "description": "Create the login form with validation",
    "activity": "Development",
    "assignedTo": "507f1f77bcf86cd799439001",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-30T00:00:00.000Z",
    "comments": [],
    "createdAt": "2024-12-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Project ID and Title are required." |
| 400 | "Task with this title already exists." |
| 400 | "Assigned user is not a member of the project." |
| 403 | "Insufficient permissions to create a task." |

**Notifications Triggered:**
- Project admins and owner receive "New Task Created" notification
- Assigned user receives "Task Assigned to You" notification

---

### Edit Task

#### `PUT /:projectId/:taskId`

Update task details.

**Authorization:** Required (Bearer Token)

**Permissions:** Admin or Owner (Level 2+)

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "status": "in progress"
}
```

**Response (200 OK):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "Updated title",
    "description": "Updated description",
    "status": "in progress",
    "priority": "medium",
    "dueDate": "2024-12-31T00:00:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "No task data provided." |
| 400 | "you do not have permission to edit this task" |

**Notifications Triggered:**
- If due date changed: "Task Due Date Updated" to assignee and admins
- Otherwise: "Task Updated" to assignee

---

### Delete Task

#### `DELETE /:projectId/:taskId`

Delete a task from the project.

**Authorization:** Required (Bearer Token)

**Permissions:** Admin or Owner (Level 2+)

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully."
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 403 | "Insufficient permissions to delete a task." |
| 404 | "Task not found" |

**Notifications Triggered:**
- Previously assigned user receives "Task Deleted" notification

---

### Assign Task

#### `PUT /:projectId/:taskId/assign`

Assign a task to a project member.

**Authorization:** Required (Bearer Token)

**Permissions:** Admin or Owner (Level 2+)

**Request Body:**
```json
{
  "assignedTo": "507f1f77bcf86cd799439002"
}
```

**Response (200 OK):**
```json
{
  "message": "Task assignment updated successfully."
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Assigned member ID is required." |
| 403 | "Insufficient permissions to assign a task." |
| 403 | "Assigned user does not belong to this project." |

**Notifications Triggered:**
- Assigned user receives "Task Assigned to You" notification
- Admins receive "Task Assignment Updated" notification (if assignee is not admin)

---

### Update Task Status

#### `PUT /:projectId/:taskId/status`

Update the status of a task.

**Authorization:** Required (Bearer Token)

**Permissions:** 
- Admin/Owner: Can update any task
- Member: Can only update tasks assigned to them

**Request Body:**
```json
{
  "status": "done"
}
```

**Allowed Status Values:**
- `"todo"`
- `"in progress"`
- `"done"`
- `"to review"`

**Response (200 OK):**
```json
{
  "message": "Task status updated successfully.",
  "task": {
    "_id": "507f1f77bcf86cd799439031",
    "status": "done"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "New status is required." |
| 403 | "you are not a member of this project" |
| 403 | "You can only change the status of tasks assigned to you." |

**Notifications Triggered:**
- Admins receive "Task Status Updated" notification

---

## Comments

### Add Comment

#### `POST /:projectId/:taskId/comment`

Add a comment to a task.

**Authorization:** Required (Bearer Token)

**Permissions:** Member, Admin, or Owner

**Request Body:**
```json
{
  "text": "This is my comment on the task"
}
```

**Response (200 OK):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "507f1f77bcf86cd799439041",
    "authorId": "507f1f77bcf86cd799439001",
    "text": "This is my comment on the task",
    "createdAt": "2024-12-26T10:00:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Comment text is required" |
| 403 | "You are not a member of this project" |

**Notifications Triggered:**
- Task assignee receives "New Comment" notification
- Comment is also broadcast via Socket.IO

---

### Get Comments

#### `GET /:projectId/:taskId/comments`

Get all comments for a task.

**Authorization:** Required (Bearer Token)

**Permissions:** Member, Admin, or Owner

**Response (200 OK):**
```json
{
  "comments": [
    {
      "_id": "507f1f77bcf86cd799439041",
      "authorId": "507f1f77bcf86cd799439001",
      "text": "This is a comment",
      "createdAt": "2024-12-26T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439042",
      "authorId": "507f1f77bcf86cd799439002",
      "text": "This is a reply",
      "createdAt": "2024-12-26T11:00:00.000Z"
    }
  ]
}
```

---

### Delete Comment

#### `DELETE /:projectId/:taskId/comment/:commentId`

Delete a comment from a task.

**Authorization:** Required (Bearer Token)

**Permissions:** 
- Comment author can delete their own comments
- Admins/Owners can delete any comment

**Response (200 OK):**
```json
{
  "message": "Comment deleted successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 403 | "You are not authorized to delete this comment" |
| 404 | "Comment not found" |

---

## Task Status Workflow

```
┌─────────────┐
│    TODO     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ IN PROGRESS │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  TO REVIEW  │◄────┐
└──────┬──────┘     │
       │            │
       ▼            │
┌─────────────┐     │
│    DONE     │─────┘ (can revert if needed)
└─────────────┘
```

---

## Task Priority Levels

| Priority | Description | Visual |
|----------|-------------|--------|
| low | Minor tasks, nice-to-have | 🟢 Green indicator |
| medium | Normal priority (default) | 🟡 Yellow indicator |
| high | Critical, needs immediate attention | 🔴 Red indicator |

---

*Last Updated: December 2025*
