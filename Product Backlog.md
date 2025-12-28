# 📋 TaskIT Product Backlog

## Product Vision

TaskIT is a simple, effective task and project management platform that helps users plan, coordinate, and track work from start to finish. The platform reduces missed deadlines and incomplete deliverables through clear project creation, task assignment, and intuitive progress tracking.

---

## 📌 Epics Overview

| Epic ID | Epic Name | Priority | Status |
|---------|-----------|----------|--------|
| E1 | User Authentication System | 🔴 High | ✅ Complete |
| E2 | Project Management Core | 🔴 High | ✅ Complete |
| E3 | Task Management System | 🔴 High | ✅ Complete |
| E4 | Collaboration Features | 🟡 Medium | ✅ Complete |
| E5 | Dashboard & Analytics | 🟡 Medium | ✅ Complete |
| E6 | Notifications System | 🟡 Medium | ✅ Complete |

---

## 📖 User Stories by Priority

### 🔴 HIGH PRIORITY - Must Have (MVP)

#### Epic 1: User Authentication System

| ID | User Story | Acceptance Criteria | Story Points | Status |
|----|------------|---------------------|--------------|--------|
| US-1.1 | As a **visitor**, I want to **create an account** so that I can access the TaskIT platform | - Registration form with name, email, password<br>- Email validation<br>- Password minimum 8 characters<br>- Success message displayed | 5 | ✅ Done |
| US-1.2 | As a **visitor**, I want to **verify my email address** so that I can confirm my account ownership | - 6-digit verification code sent via email<br>- Code expires in 10 minutes<br>- Resend code option available | 3 | ✅ Done |
| US-1.3 | As a **user**, I want to **login to my account** so that I can access my projects and tasks | - Login with email/password<br>- JWT token generated<br>- Device info tracked for sessions<br>- Remember device option | 5 | ✅ Done |
| US-1.4 | As a **user**, I want to **reset my password** so that I can regain access if I forget it | - Request reset via email<br>- 6-digit code verification<br>- Set new password with token<br>- Auto-login after reset | 5 | ✅ Done |
| US-1.5 | As a **user**, I want to **logout of my account** so that I can secure my session | - Logout button in UI<br>- Token invalidated on server<br>- Redirected to login page | 2 | ✅ Done |

#### Epic 2: Project Management Core

| ID | User Story | Acceptance Criteria | Story Points | Status |
|----|------------|---------------------|--------------|--------|
| US-2.1 | As a **user**, I want to **create a new project** so that I can organize my work effectively | - Project name (unique, required)<br>- Display name (optional)<br>- Description (optional)<br>- Creator becomes owner | 3 | ✅ Done |
| US-2.2 | As a **project owner/admin**, I want to **edit project details** so that I can update information as the project evolves | - Edit name, display name, description<br>- Only admins and owner can edit<br>- Validation for unique name | 3 | ✅ Done |
| US-2.3 | As a **user**, I want to **view a list of all my projects** so that I can easily navigate between them | - Grid/List view toggle<br>- Search functionality<br>- Filter by role (owner/member)<br>- Sort options | 5 | ✅ Done |
| US-2.4 | As a **project owner**, I want to **delete a project** so that I can remove completed or unnecessary projects | - Password confirmation required<br>- All associated data deleted<br>- Members notified | 3 | ✅ Done |
| US-2.5 | As a **project owner**, I want to **transfer project ownership** to another member so that leadership can change | - Password confirmation required<br>- New owner must be existing member<br>- Previous owner becomes admin | 3 | ✅ Done |

#### Epic 3: Task Management System

| ID | User Story | Acceptance Criteria | Story Points | Status |
|----|------------|---------------------|--------------|--------|
| US-3.1 | As a **project admin**, I want to **create tasks within a project** so that work can be tracked | - Title (required)<br>- Description, priority, due date, status<br>- Optional assignment to member | 5 | ✅ Done |
| US-3.2 | As a **project admin**, I want to **assign tasks to team members** so that responsibilities are defined | - Select from project members<br>- Assignee receives notification<br>- Validation that user is member | 3 | ✅ Done |
| US-3.3 | As a **project admin**, I want to **set due dates for tasks** so that deadlines are trackable | - Date picker UI<br>- Due date displayed on task cards<br>- Calendar view integration | 2 | ✅ Done |
| US-3.4 | As a **project member**, I want to **update task status** so that progress is visible | - Status: Todo, In Progress, To Review, Done<br>- Members can update assigned tasks<br>- Admins can update any task | 3 | ✅ Done |
| US-3.5 | As a **project admin**, I want to **set priority levels for tasks** so that the team can focus | - Priority: Low, Medium, High<br>- Visual indicators in UI<br>- Default: Medium | 2 | ✅ Done |
| US-3.6 | As a **project admin**, I want to **delete tasks** so that completed work can be archived | - Admin/owner permission required<br>- Assigned user notified<br>- Confirmation dialog | 2 | ✅ Done |

---

### 🟡 MEDIUM PRIORITY - Should Have

#### Epic 4: Collaboration Features

| ID | User Story | Acceptance Criteria | Story Points | Status |
|----|------------|---------------------|--------------|--------|
| US-4.1 | As a **project owner**, I want to **invite team members** so that we can collaborate | - Invite via email<br>- Invitation email sent with link<br>- Pending invites tracked | 5 | ✅ Done |
| US-4.2 | As a **project owner**, I want to **assign different roles to members** so that permissions are managed | - Roles: Admin, Member<br>- Role change notifications<br>- Owner-only action | 3 | ✅ Done |
| US-4.3 | As a **project owner/admin**, I want to **remove members** from my project so that access is restricted | - Admin+ permission required<br>- Removed user notified<br>- User's assigned tasks unassigned | 2 | ✅ Done |
| US-4.4 | As a **project member**, I want to **comment on tasks** so that I can provide updates and feedback | - Text comments<br>- Timestamp and author shown<br>- Delete own comments | 3 | ✅ Done |
| US-4.5 | As an **invited user**, I want to **accept or decline project invitations** so that I control my participation | - Accept/Decline buttons<br>- Project added on accept<br>- Invitation deleted on response | 3 | ✅ Done |

#### Epic 5: Dashboard & Analytics

| ID | User Story | Acceptance Criteria | Story Points | Status |
|----|------------|---------------------|--------------|--------|
| US-5.1 | As a **user**, I want to **see a dashboard overview** so that I can quickly understand my workload | - Projects summary card<br>- Tasks summary card<br>- Team members card | 5 | ✅ Done |
| US-5.2 | As a **user**, I want to **see project progress** so that I can track completion status | - Progress percentage per project<br>- Visual progress bars<br>- Task completion stats | 3 | ✅ Done |
| US-5.3 | As a **user**, I want to **see all tasks assigned to me** across all projects so I can manage workload | - Aggregated task list<br>- Filter by status/priority<br>- Quick status update | 3 | ✅ Done |
| US-5.4 | As a **user**, I want to **view tasks in a calendar** so I can see deadlines visually | - Monthly calendar view<br>- Tasks shown on due dates<br>- Click to view task details | 5 | ✅ Done |

#### Epic 6: Notifications System

| ID | User Story | Acceptance Criteria | Story Points | Status |
|----|------------|---------------------|--------------|--------|
| US-6.1 | As a **user**, I want to **receive in-app notifications** so I'm aware of activities | - Real-time via Socket.IO<br>- Notification dropdown<br>- Unread count badge | 5 | ✅ Done |
| US-6.2 | As a **user**, I want to **mark notifications as read** so I can track what I've seen | - Mark individual as read<br>- Mark all as read<br>- Visual distinction | 2 | ✅ Done |
| US-6.3 | As a **user**, I want to **receive email notifications** for important events | - Project invitations via email<br>- Verification codes<br>- Password reset emails | 3 | ✅ Done |
| US-6.4 | As a **user**, I want to **delete notifications** so I can keep my inbox clean | - Delete individual<br>- Delete all read<br>- Delete all notifications | 2 | ✅ Done |

---

### 🟢 LOW PRIORITY - Could Have

#### Epic 1: User Authentication (Extended)

| ID | User Story | Acceptance Criteria | Story Points | Status |
|----|------------|---------------------|--------------|--------|
| US-1.6 | As a **user**, I want to **edit my profile information** so I can keep details up-to-date | - Update name<br>- Validation rules applied | 2 | ✅ Done |
| US-1.7 | As a **user**, I want to **change my email address** so I can update my contact info | - Verification code to new email<br>- Confirm before change | 3 | ✅ Done |
| US-1.8 | As a **user**, I want to **change my password** so I can improve security | - Current password required<br>- New password validation | 2 | ✅ Done |
| US-1.9 | As a **user**, I want to **delete my account** so I can remove my data | - Verification code required<br>- All user data cleaned up<br>- Project ownership transferred | 5 | ✅ Done |

---

## 📊 Notification Types

| Type | Description | Recipients |
|------|-------------|------------|
| TASK_CREATED | New task created in project | Project admins/owner |
| TASK_ASSIGNED | Task assigned to a user | Assigned user |
| TASK_STATUS_CHANGED | Task status updated | Assigned user + admins |
| TASK_EDITED | Task details modified | Assigned user |
| TASK_DELETED | Task removed | Previously assigned user |
| TASK_COMMENT | New comment on a task | Task participants |
| PROJECT_INVITE_SENT | Invitation sent | Invited user |
| PROJECT_INVITE_ACCEPTED | User accepted invitation | Project owner/admins |
| PROJECT_INVITE_DECLINED | User declined invitation | Inviter |
| PROJECT_MEMBER_REMOVED | Member removed from project | Removed member |
| PROJECT_ROLE_UPDATED | Member role changed | Affected member |
| PROJECT_OWNERSHIP_TRANSFERRED | Ownership transferred | New owner + members |
| PROJECT_EDITED | Project details modified | All members |
| PROJECT_DELETED | Project deleted | All former members |

---

## 📈 Backlog Summary

| Category | Total Stories | Completed | In Progress | Remaining |
|----------|---------------|-----------|-------------|-----------|
| High Priority | 16 | 16 | 0 | 0 |
| Medium Priority | 13 | 13 | 0 | 0 |
| Low Priority | 4 | 4 | 0 | 0 |
| **Total** | **33** | **33** | **0** | **0** |

---

## 🔮 Future Enhancements (Icebox)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-1 | File Attachments | Attach files to tasks | Low |
| F-2 | @Mentions | Mention team members in comments | Low |
| F-3 | Task Dependencies | Link dependent tasks | Low |
| F-4 | Time Tracking | Log time spent on tasks | Low |
| F-5 | Recurring Tasks | Create repeating tasks | Low |
| F-6 | Mobile App | Native iOS/Android apps | Medium |
| F-7 | Google OAuth | Login with Google | Medium |
| F-8 | Project Templates | Pre-defined project structures | Low |
| F-9 | Export/Import | Export projects to CSV/JSON | Low |
| F-10 | Activity Timeline | Project activity history | Low |

---
