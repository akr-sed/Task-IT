# 📚 TaskIT Documentation

Welcome to the TaskIT documentation. This guide covers everything you need to know about the project.

---

## Quick Navigation

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System design and data flow |
| [Setup Guide](setup.md) | Development environment setup |
| [Deployment](deployment.md) | Production deployment guide |
| [API Reference](api/) | Backend API documentation |
| [Database](database/) | MongoDB schema and relationships |
| [Frontend](frontend/) | React components and hooks |

---

## Documentation Structure

```
docs/
├── README.md              # This file - Documentation index
├── architecture.md        # System architecture overview
├── setup.md               # Development setup guide
├── deployment.md          # Production deployment
│
├── api/                   # API Documentation
│   ├── authentication.md  # Auth endpoints
│   ├── projects.md        # Project endpoints
│   ├── tasks.md           # Task endpoints
│   ├── notifications.md   # Notification endpoints
│   └── dashboard.md       # Dashboard data sources
│
├── database/              # Database Documentation
│   ├── schema.md          # MongoDB collections
│   └── relationships.md   # Data relationships
│
└── frontend/              # Frontend Documentation
    ├── README.md          # Frontend overview
    ├── components.md      # React components
    └── hooks.md           # Custom hooks
```

> **Note:** The following legacy files are deprecated and kept for historical reference only:
> - `schema.md` (root level) → Use `database/schema.md` instead
> - `product_Backlog.md` (root level) → Use root `Product Backlog.md` instead
> - `SETUP.md` → Use `setup.md` instead

---

## Getting Started

1. **New Developers:** Start with the [Setup Guide](setup.md)
2. **Understanding the System:** Read the [Architecture](architecture.md)
3. **Backend Work:** Check [API Reference](api/)
4. **Frontend Work:** See [Frontend Guide](frontend/)
5. **Deploying:** Follow the [Deployment Guide](deployment.md)

---

## Project Overview

TaskIT is a web-based task and project management platform built with the MERN stack.

### Key Features

- ✅ Project creation and management
- ✅ Task assignment and tracking
- ✅ Team collaboration with roles
- ✅ Real-time notifications
- ✅ Email invitations
- ✅ Calendar view for due dates
- ✅ Activity logging

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19.1, Vite 7.1, Tailwind CSS 3.4 |
| Backend | Node.js 18+, Express 4.18 |
| Database | MongoDB with Mongoose 8.14 |
| Real-time | Socket.IO 4.8 |
| Auth | JWT, bcrypt |
| Email | Nodemailer with Gmail API |

---

## User Roles

| Role | Permission Level | Capabilities |
|------|-----------------|--------------|
| Owner | 3 (Highest) | Full control, invite members, transfer ownership, delete project |
| Admin | 2 | Manage tasks, update member roles, remove members |
| Member | 1 | View tasks, update assigned tasks, comment |

---

## API Overview

| Endpoint Group | Base Path | Description |
|----------------|-----------|-------------|
| Authentication | `/api/auth` | Login, register, password reset |
| Projects | `/api/projects` | CRUD, invitations, members |
| Tasks | `/api/tasks` | CRUD, assignment, comments |
| Notifications | `/api/notifications` | Activity logs, mark read |
| Logs | `/api/logs` | Activity history |

---

## Additional Resources

### Root Level Documents

| Document | Location | Description |
|----------|----------|-------------|
| [Project README](../README.md) | Root | Project overview |
| [Product Backlog](../Product%20Backlog.md) | Root | User stories |
| [Sprint Backlog](../Sprint%20Backlog.md) | Root | Sprint planning |
| [Increment](../Increment.md) | Root | Release history |
| [Definition of Done](../Definition%20of%20Done.md) | Root | Completion criteria |

---

## Contributing to Docs

When updating documentation:

1. Keep language clear and concise
2. Include code examples where helpful
3. Update the table of contents if adding sections
4. Test all links before committing
5. Use consistent formatting

---

*Last Updated: December 2025*

---
---

# Software Requirements Specification (SRS) for Taskit

## 1. Introduction

### 1.1 Purpose

The purpose of this software is to provide a simple, effective task and project management platform that helps users plan, coordinate, and track work from start to finish, reducing missed deadlines and incomplete deliverables through clear project creation, task assignment, and intuitive progress tracking.

Initially optimized for students managing coursework and group projects, the system is equally suited to small teams, freelancers, clubs, startups, agencies, and operational groups that value simplicity over complexity, enabling fast onboarding, minimal configuration, and clear visibility into who is doing what and when.

By focusing on lightweight workflows—organizing projects, assigning tasks, setting due dates, and visualizing progress—the platform delivers just enough structure to keep work on schedule without burdening users with heavy processes, making it a practical fit for both academic and small-scale professional environments.

### 1.2 Scope

The system is a **web-based task management application** built using
the MERN stack (MongoDB, Express.js, React.js, Node.js).\
- Users can register, log in, and manage multiple projects.\
- Project owners can create projects, invite members, and assign roles
(admin/member).\
- Admins can create and manage tasks.\
- Members can view tasks, mark them as complete, and add comments.\
- A simple dashboard provides project progress visualization (progress
bars).\
- Notifications are available in-app, with key events (e.g.,
invitations) sent via email.

The system is intended for demo-scale usage (50--100 users), with future
potential for deployment and expansion.

### 1.3 Definitions, Acronyms, Abbreviations

-   **MERN**: MongoDB, Express.js, React.js, Node.js\
-   **API**: Application Programming Interface\
-   **UI/UX**: User Interface / User Experience\
-   **Owner**: Creator of a project with full control.\
-   **Admin**: User with elevated privileges to manage tasks and
    members.\
-   **Member**: Regular user with basic task interaction permissions.

### 1.4 References

-   IEEE 830 Standard for Software Requirements Specification\
-   Internal team brainstorming and requirements gathering

### 1.5 Overview

This document outlines the functional and non-functional requirements,
system features, user classes, and constraints for the Task Management
Software.

------------------------------------------------------------------------

## 2. Overall Description

### 2.1 Product Perspective

The product is a standalone web application built on the MERN stack. It
does not depend on external systems but may later integrate with Google
OAuth for authentication and optional email services for notifications.

### 2.2 Product Functions

-   User registration, login, and profile management\
-   Project creation, invitation, and role assignment\
-   Task creation, update, deletion, and completion marking\
-   Task comments\
-   Dashboard with progress visualization\
-   In-app notifications and email invitations

### 2.3 User Classes and Characteristics

-   **Owner**: Creates and manages the project, assigns roles.\
-   **Admin**: Creates/updates/deletes tasks, manages members.\
-   **Member**: Views tasks, marks assigned tasks complete, comments.

### 2.4 Operating Environment

-   Platform: Web application (desktop and mobile browsers)\
-   Technology stack: React.js (Frontend), Node.js + Express.js
    (Backend), MongoDB (Database)\
-   Deployment: Local demo, with possible future online hosting (Heroku,
    Vercel, etc.)

### 2.5 Design and Implementation Constraints

-   Must be implemented with the MERN stack\
-   Styling to be done with Bootstrap\
-   Initially designed for demo-scale use (≤100 users)

### 2.6 User Documentation

-   User guide/manual will be provided\
-   Documentation lead responsible for SRS, design documents, and API
    references

### 2.7 Assumptions and Dependencies

-   Users have basic internet and browser access\
-   Email notifications depend on third-party email service integration\
-   Possible future extension to mobile app

------------------------------------------------------------------------

## 3. Specific Requirements

### 3.1 Functional Requirements

1.  **Authentication**
    -   Users can register and log in with email/password.\
    -   Google OAuth login supported.\
    -   Logout option available.
2.  **User Management**
    -   Update profile information (name, email, password, picture).\
    -   Delete account.
3.  **Project Management**
    -   Create, edit, delete projects.\
    -   Invite users to projects (email-based).\
    -   Assign project roles (Owner/Admin/Member).\
    -   Transfer ownership or change admin privileges.
4.  **Task Management**
    -   Add, edit, delete tasks.\
    -   Assign tasks to members.\
    -   Mark tasks as completed/in progress/pending.\
    -   Attach files to tasks.\
    -   Comment on tasks.
5.  **Dashboard**
    -   Display projects user is part of.\
    -   Show progress per project using progress bars.
6.  **Notifications**
    -   In-app notifications for task assignment, completion, updates.\
    -   Email notification for project invitations.

### 3.2 Non-Functional Requirements

-   **Performance**: Must support at least 50--100 users
    simultaneously.\
-   **Security**: Basic password hashing and role-based access control.\
-   **Availability**: Designed for demo usage, not 24/7 reliability.\
-   **Usability**: Simple, student-friendly UI.\
-   **Scalability**: Should be extendable for future features.

------------------------------------------------------------------------

## 4. System Features (Detailed Use Cases)

-   **UC1: Register/Login**: User creates account or logs in.\
-   **UC2: Create Project**: Owner creates a project and invites
    members.\
-   **UC3: Assign Role**: Owner promotes/demotes admins.\
-   **UC4: Manage Tasks**: Admin adds/updates/deletes tasks.\
-   **UC5: Complete Task**: Member marks task as complete.\
-   **UC6: Comment on Task**: Member/Admin adds comments to tasks.\
-   **UC7: View Dashboard**: User sees project progress summary.\
-   **UC8: Notifications**: User receives in-app and email
    notifications.

------------------------------------------------------------------------

## 5. Other Requirements

-   **Reliability**: Minimal downtime for demo.\
-   **Maintainability**: Code should be modular and documented.\
-   **Portability**: Should run on modern browsers (Chrome, Firefox,
    Edge).
