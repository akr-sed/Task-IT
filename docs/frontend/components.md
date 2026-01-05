# 📦 React Components Reference

Complete reference for all TaskIT React components.

---

## Table of Contents

- [Layout Components](#layout-components)
- [Authentication Components](#authentication-components)
- [Common Components](#common-components)
- [Dashboard Components](#dashboard-components)
- [Project Components](#project-components)
- [Task Components](#task-components)
- [Tasks Page Components](#tasks-page-components)
- [Settings Components](#settings-components)

---

## Layout Components

### MainLayout

Main application wrapper for authenticated pages.

**Location:** `components/layout/MainLayout.jsx`

**Features:**
- Sidebar toggle
- User session management
- Socket.IO connection for real-time notifications
- Toast notifications display
- Logout handling

**Usage:**
```jsx
<Route element={<MainLayout />}>
  {/* Protected routes */}
</Route>
```

**State:**
| State | Type | Description |
|-------|------|-------------|
| sidebarOpen | boolean | Sidebar visibility |
| user | object | Current user data |
| loggingOut | boolean | Logout in progress |
| toasts | array | Active toast notifications |

---

### SideBar

Navigation sidebar with links to all app sections.

**Location:** `components/layout/SideBar.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Sidebar expanded state |
| onToggle | function | Yes | Toggle callback |

**Features:**
- Responsive collapse/expand
- Active route highlighting
- Navigation links with icons

---

### TopBar

Header bar with user menu and actions.

**Location:** `components/layout/TopBar.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | object | Yes | Current user object |
| onLogout | function | Yes | Logout callback |
| onToggleSidebar | function | Yes | Sidebar toggle callback |

**Features:**
- User avatar and name
- Notification dropdown
- Settings quick access
- Logout button

---

## Authentication Components

### LoginForm

User login page with email and password.

**Location:** `components/authentication/LoginForm.jsx`

**Features:**
- Email/password validation
- Remember last route
- Link to signup
- Link to password reset
- Error message display
- Loading state during submission

**Flow:**
1. User enters credentials
2. Submit to `/api/auth/login`
3. Store token and user in localStorage
4. Redirect to last route or dashboard

---

### SignupForm

New user registration form.

**Location:** `components/authentication/SignupForm.jsx`

**Fields:**
| Field | Validation |
|-------|------------|
| Name | Required, 3-50 chars |
| Email | Required, valid email |
| Password | Required, 8+ chars |
| Confirm Password | Must match password |

**Flow:**
1. User fills registration form
2. Submit to `/api/auth/register`
3. Redirect to verification page
4. Email with verification code sent

---

### VerificationForm

Email verification code input.

**Location:** `components/authentication/VerificationForm.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| email | string | Email to verify (from signup) |

**Features:**
- 6-digit code input
- Resend code option
- 10-minute expiration notice

---

### RequestPasswordResetForm

Password reset request form.

**Location:** `components/authentication/RequestPasswordResetForm.jsx`

**Flow:**
1. User enters email
2. Submit to `/api/auth/forget-password`
3. Verification code sent
4. Redirect to reset flow

---

### PasswordResetFlow

Multi-step password reset process.

**Location:** `components/authentication/PasswordResetFlow.jsx`

**Steps:**
1. Enter verification code
2. Enter new password
3. Confirm new password
4. Submit and redirect to login

---

## Common Components

### Avatar

User avatar with initials fallback.

**Location:** `components/common/Avatar.jsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | - | User's name for initials |
| src | string | null | Image URL |
| size | string | 'md' | Size: 'sm', 'md', 'lg', 'xl' |
| className | string | '' | Additional CSS classes |

**Usage:**
```jsx
<Avatar name="John Doe" size="lg" />
<Avatar src="/user.jpg" name="Jane" />
```

---

### Card

Reusable card container.

**Location:** `components/common/Card.jsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | node | - | Card content |
| className | string | '' | Additional CSS classes |
| title | string | null | Card header title |
| actions | node | null | Header actions (buttons) |

**Usage:**
```jsx
<Card title="Recent Tasks" actions={<Button>View All</Button>}>
  <TaskList tasks={tasks} />
</Card>
```

---

### EmptyState

Empty state display with icon and message.

**Location:** `components/common/EmptyState.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| icon | component | No | Lucide icon component |
| title | string | Yes | Primary message |
| description | string | No | Secondary message |
| action | node | No | CTA button |

**Usage:**
```jsx
<EmptyState
  icon={FolderIcon}
  title="No projects yet"
  description="Create your first project to get started"
  action={<Button onClick={handleCreate}>Create Project</Button>}
/>
```

---

### NotificationDropdown

Notifications dropdown in header.

**Location:** `components/common/NotificationDropdown.jsx`

**Features:**
- Unread count badge
- Recent notifications list
- Mark as read on click
- Link to notifications page
- Mark all as read

---

### NotificationToast

Real-time notification toast popup.

**Location:** `components/common/NotificationToast.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| notification | object | Notification data |
| onDismiss | function | Dismiss callback |
| onClick | function | Click callback |

**Features:**
- Auto-dismiss after 5 seconds
- Click to navigate
- Manual dismiss button
- Stacked display (max 5)

---

## Dashboard Components

Dashboard cards are located in `components/dashboard/cards/`.

### ProjectsCard

Displays project summary and recent projects.

**Location:** `components/dashboard/cards/ProjectsCard.jsx`

**Features:**
- Total projects count
- My projects vs shared projects breakdown
- Quick navigation to projects page

---

### TasksCard

Shows task statistics and status breakdown.

**Location:** `components/dashboard/cards/TasksCard.jsx`

**Features:**
- Total tasks count
- Status breakdown (todo, in progress, to review, done)
- Overdue tasks indicator

---

### TeamMembersCard

Team members overview from all projects.

**Location:** `components/dashboard/cards/TeamMembersCard.jsx`

**Features:**
- Unique team members across projects
- Member avatars with name
- Role indicators

---

### ActivityCard

Recent activity and notifications feed.

**Location:** `components/dashboard/cards/ActivityCard.jsx`

**Features:**
- Recent notifications display
- Notification type icons
- Quick navigation to notifications page

---

### CalendarCard

Calendar widget for task due dates.

**Location:** `components/dashboard/cards/CalendarCard.jsx`

**Features:**
- Month view
- Task due dates highlighted
- Click date to filter tasks
- Today indicator

---

### ProgressCard

Project progress visualization.

**Location:** `components/dashboard/cards/ProgressCard.jsx`

**Features:**
- Progress bar per project
- Completion percentage calculation
- Task status visual breakdown

---

### InvitationsCard

Pending project invitations display.

**Location:** `components/dashboard/cards/InvitationsCard.jsx`

**Features:**
- List of pending invitations
- Project name and inviter info
- Accept/decline actions

---

### FloatingActionButton

Quick action button for dashboard.

**Location:** `components/dashboard/shared/FloatingActionButton.jsx`

**Features:**
- Floating button at bottom right
- Quick access to create actions

---

## Project Components

### CreateProject

New project creation form.

**Location:** `components/projects/CreateProject.jsx`

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Unique project identifier |
| displayName | No | Human-readable name |
| description | No | Project description |

---

### EditProject

Project settings and editing.

**Location:** `components/projects/EditProject.jsx`

**Features:**
- Edit name, displayName, description
- Manage members
- Update member roles
- Transfer ownership
- Delete project

---

### ProjectDetails

Full project view with tasks.

**Location:** `components/projects/ProjectDetails.jsx`

**Tabs:**
- Overview (stats, recent activity)
- Tasks (task list/board)
- Members (team management)
- Settings (project settings)

---

### ProjectOverview

Project overview display on projects page.

**Location:** `components/projects/ProjectOverview.jsx`

**Features:**
- Project summary information
- Task count and progress
- Quick actions

---

### ProjectTeam

Team management within a project.

**Location:** `components/projects/ProjectTeam.jsx`

**Features:**
- Team members list
- Role badges (Owner/Admin/Member)
- Invite new members
- Role management (for Owner)
- Remove members (for Admin+)

---

### AcceptInvite

Project invitation acceptance.

**Location:** `components/projects/AcceptInvite.jsx`

**Features:**
- Display invitation details
- Accept/decline actions
- Redirect to project on accept

---

## Task Components

### TaskList

Task list display with filtering.

**Location:** `components/tasks/TaskList.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| tasks | array | Task list |
| projectId | string | Current project |
| onTaskSelect | function | Task click handler |
| onTaskUpdate | function | Task update callback |

**Features:**
- Status filtering
- Priority filtering
- Search
- Sort options
- Bulk actions

---

### TaskDetail

Individual task view/edit.

**Location:** `components/tasks/TaskDetail.jsx`

**Features:**
- View/edit title, description
- Change status
- Change priority
- Set due date
- Assign/unassign user
- Comments section
- Delete task

---

### TaskAssignment

Task assignment board view.

**Location:** `components/tasks/TaskAssignment.jsx`

**Features:**
- Kanban-style board
- Drag and drop (status change)
- Column: Unassigned, by Assignee
- Quick assignment actions

---

## Tasks Page Components

Specialized components for the TasksPage view, located in `components/tasksPageComponents/`.

### BoardMode

Kanban board view for tasks.

**Location:** `components/tasksPageComponents/BoardMode.jsx`

**Features:**
- Kanban-style columns by status
- Drag and drop support
- Task card display

---

### ListMode

List view for tasks.

**Location:** `components/tasksPageComponents/ListMode.jsx`

**Features:**
- Table/list display
- Sorting and filtering
- Compact task rows

---

### TaskDetailModal

Task details modal overlay.

**Location:** `components/tasksPageComponents/TaskDetailModal.jsx`

**Features:**
- Full task information display
- Edit capabilities
- Comments section
- Assignment controls

---

### TaskListCard

Individual task card for list views.

**Location:** `components/tasksPageComponents/TaskListCard.jsx`

**Features:**
- Task summary display
- Status and priority badges
- Due date indicator
- Assignee avatar

---

## Settings Components

The settings page is composed of multiple card components in `components/settings/`.

### PersonalInfoCard

User profile information management.

**Location:** `components/settings/PersonalInfoCard.jsx`

**Features:**
- Display user name and email
- Update profile name
- Edit profile information

---

### SecurityCard

Password and security settings.

**Location:** `components/settings/SecurityCard.jsx`

**Features:**
- Change password
- Password strength requirements
- Current password verification

---

### EmailChangeModal

Email change flow modal.

**Location:** `components/settings/EmailChangeModal.jsx`

**Features:**
- Request email change
- Verification code input
- Confirmation handling

---

### DangerZoneCard

Account danger zone actions.

**Location:** `components/settings/DangerZoneCard.jsx`

**Features:**
- Account deletion trigger
- Warning display
- Confirmation required

---

### AccountDeletionModal

Account deletion confirmation modal.

**Location:** `components/settings/AccountDeletionModal.jsx`

**Features:**
- Deletion verification code
- Final confirmation
- Account removal process

---

### NotificationsCard

Notification preferences card.

**Location:** `components/settings/NotificationsCard.jsx`

**Features:**
- Notification settings display
- Email/in-app toggles (planned)

---

### PreferencesCard

User preferences settings.

**Location:** `components/settings/PreferencesCard.jsx`

**Features:**
- Theme preferences (planned)
- Display settings (planned)

---

### SettingsHeader

Settings page header.

**Location:** `components/settings/SettingsHeader.jsx`

**Features:**
- Settings page title
- User avatar display

---

### MessageAlert

Alert message component for settings feedback.

**Location:** `components/settings/MessageAlert.jsx`

**Features:**
- Success/error message display
- Auto-dismiss support

---

## Component Creation Guidelines

### File Structure
```jsx
// components/[category]/MyComponent.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MyComponent = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(null);
  
  // Logic...
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func,
};

MyComponent.defaultProps = {
  prop2: 0,
  onAction: () => {},
};

export default MyComponent;
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TaskCard.jsx` |
| Hooks | camelCase with `use` | `useDashboardData.js` |
| Utils | camelCase | `dateUtils.js` |
| Services | camelCase with `Service` | `projectService.js` |

---

*Last Updated: December 2025*
