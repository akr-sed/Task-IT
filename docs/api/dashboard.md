# 📊 Dashboard API

Base URL: `/api`

## Overview

The Dashboard functionality is built using aggregated data from multiple endpoints. This document describes the endpoints and data used to populate the dashboard.

---

## Dashboard Data Sources

The dashboard is a composite view that pulls data from various endpoints:

| Dashboard Card | Data Source | Endpoint |
|----------------|-------------|----------|
| Projects Card | Projects list | `GET /api/projects` |
| Tasks Card | User's assigned tasks | `GET /api/tasks` |
| Team Members Card | Aggregated from projects | `GET /api/projects` |
| Activity Card | User notifications | `GET /api/notifications/me` |
| Calendar Card | Tasks with due dates | `GET /api/tasks/all-projects` |
| Progress Card | Calculated from tasks | `GET /api/tasks/all-projects` |
| Invitations Card | Pending invitations | `GET /api/projects/fetch-invites` |

---

## Projects Data

### `GET /api/projects`

Returns all projects the user owns or is a member of.

**Response Fields Used in Dashboard:**
```json
{
  "projects": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "project-alpha",
      "displayName": "Project Alpha",
      "description": "Project description",
      "ownedBy": "507f1f77bcf86cd799439001",
      "members": [
        { "id": "...", "role": "admin" },
        { "id": "...", "role": "member" }
      ],
      "createdAt": "2024-12-25T10:30:00.000Z"
    }
  ]
}
```

**Dashboard Calculations:**
- **Total Projects**: `projects.length`
- **My Projects**: `projects.filter(p => p.ownedBy === userId).length`
- **Shared Projects**: `projects.filter(p => p.ownedBy !== userId).length`

---

## Tasks Data

### `GET /api/tasks`

Returns tasks assigned to the current user.

**Response Fields Used in Dashboard:**
```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "projectId": "507f1f77bcf86cd799439011",
      "title": "Task title",
      "status": "todo",
      "priority": "high",
      "dueDate": "2024-12-30T00:00:00.000Z"
    }
  ]
}
```

### `GET /api/tasks/all-projects`

Returns all tasks from all user's projects.

**Dashboard Calculations:**
- **Total Tasks**: `tasks.length`
- **Todo Count**: `tasks.filter(t => t.status === 'todo').length`
- **In Progress Count**: `tasks.filter(t => t.status === 'in progress').length`
- **Done Count**: `tasks.filter(t => t.status === 'done').length`
- **Overdue Count**: `tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'done').length`

---

## Progress Calculation

The progress for each project is calculated client-side:

```javascript
function calculateProjectProgress(projectId, allTasks) {
  const projectTasks = allTasks.filter(t => t.projectId === projectId);
  
  if (projectTasks.length === 0) return 0;
  
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  
  return Math.round((completedTasks / projectTasks.length) * 100);
}
```

**Progress Response Format (Client-Calculated):**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "projectName": "Project Alpha",
  "totalTasks": 10,
  "completedTasks": 6,
  "progress": 60
}
```

---

## Team Members Data

Team members are aggregated from all projects:

```javascript
function getUniqueTeamMembers(projects, userId) {
  const memberMap = new Map();
  
  projects.forEach(project => {
    // Add owner
    if (project.ownedBy !== userId) {
      memberMap.set(project.ownedBy, { role: 'owner' });
    }
    
    // Add members
    project.members.forEach(member => {
      if (member.id !== userId) {
        memberMap.set(member.id, { role: member.role });
      }
    });
  });
  
  return Array.from(memberMap.keys());
}
```

**Member Details Retrieved Via:**
- `POST /api/auth/batch` with array of user IDs

---

## Activity Feed Data

### `GET /api/notifications/me`

Returns recent notifications for the activity feed.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Response Fields Used in Dashboard:**
```json
{
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439051",
      "title": "Task Assigned",
      "content": "John assigned you to 'Implement login'",
      "type": "TASK_ASSIGNED",
      "createdAt": "2024-12-25T14:30:00.000Z",
      "isRead": false,
      "projectId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Project Alpha"
      },
      "userCreated": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "John Doe"
      }
    }
  ]
}
```

---

## Calendar Data

The calendar uses tasks with due dates:

```javascript
function groupTasksByDate(tasks) {
  const grouped = {};
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = task.dueDate.split('T')[0]; // YYYY-MM-DD
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push({
        id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId
      });
    }
  });
  
  return grouped;
}
```

**Calendar Response Format (Client-Calculated):**
```json
{
  "2024-12-25": [
    {
      "id": "507f1f77bcf86cd799439031",
      "title": "Task 1",
      "status": "todo",
      "priority": "high"
    }
  ],
  "2024-12-30": [
    {
      "id": "507f1f77bcf86cd799439032",
      "title": "Task 2",
      "status": "in progress",
      "priority": "medium"
    }
  ]
}
```

---

## Invitations Data

### `GET /api/projects/fetch-invites`

Returns pending project invitations.

**Response:**
```json
{
  "invitations": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "projectId": "507f1f77bcf86cd799439011",
      "invitedBy": "507f1f77bcf86cd799439001",
      "inviteCode": "abc123def456"
    }
  ],
  "projectNames": {
    "507f1f77bcf86cd799439011": "Project Alpha"
  },
  "invitorNames": {
    "507f1f77bcf86cd799439021": "John Doe"
  },
  "invitorEmails": {
    "507f1f77bcf86cd799439021": "john@example.com"
  }
}
```

---

## Dashboard Data Hook

The frontend uses a custom hook `useDashboardData` to aggregate all data:

```javascript
// Example usage
const {
  projects,      // All user's projects
  invitations,   // Pending invitations
  tasks,         // All tasks from all projects
  teamMembers,   // Unique team members with details
  loading,       // Loading state
  invitesLoading // Invites loading state
} = useDashboardData();
```

**Data Flow:**
1. Fetch projects on mount
2. Fetch tasks and invitations in parallel
3. Extract unique member IDs from projects
4. Batch fetch member details
5. Calculate progress and statistics

---

## Performance Optimizations

### Caching

GET requests are cached client-side with configurable TTL:

```javascript
// Cache configuration
const CACHE_TTL = {
  projects: 60000,      // 1 minute
  tasks: 30000,         // 30 seconds
  notifications: 30000, // 30 seconds
  users: 300000         // 5 minutes
};
```

### Request Deduplication

Duplicate concurrent requests are deduplicated:

```javascript
// Prevents multiple simultaneous calls to same endpoint
const pendingRequests = new Map();

function deduplicatedFetch(key, fetchFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}
```

### Parallel Fetching

Independent requests are made in parallel:

```javascript
// Efficient parallel fetching
const [projectsRes, tasksRes, invitesRes] = await Promise.allSettled([
  projectService.getAllProjects(),
  taskService.getAllProjectsTasks(),
  projectService.getMyInvitations()
]);
```

---

*Last Updated: December 2025*
