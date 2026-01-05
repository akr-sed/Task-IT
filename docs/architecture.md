# 🏗️ TaskIT System Architecture

## Overview

TaskIT follows a modern three-tier architecture built on the MERN stack (MongoDB, Express.js, React, Node.js) with real-time capabilities powered by Socket.IO.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        React Application                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Pages     │  │ Components  │  │   Hooks     │  │   Utils     │  │  │
│  │  │ - Dashboard │  │ - Layout    │  │ - useData   │  │ - cache     │  │  │
│  │  │ - Projects  │  │ - Tasks     │  │ - useCalendr│  │ - date      │  │  │
│  │  │ - Tasks     │  │ - Auth      │  │             │  │ - avatar    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      API Service Layer                          │  │  │
│  │  │  authService | projectService | taskService | notificationSvc   │  │  │
│  │  │                     ↓                                           │  │  │
│  │  │              axiosInstance (HTTP + Caching)                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                           │                    │                       │  │
│  │                      REST API            WebSocket                     │  │
│  └───────────────────────────┼──────────────────┼─────────────────────────┘  │
└──────────────────────────────┼──────────────────┼────────────────────────────┘
                               │                  │
                               ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Express.js Application                             │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      Middleware Stack                            │  │  │
│  │  │  CORS → RateLimiter → BodyParser → Auth → Validation → Routes   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Routes    │  │ Controllers │  │   Utils     │  │  Socket.IO  │  │  │
│  │  │ - /auth     │  │ - userCtrl  │  │ - email     │  │ - realtime  │  │  │
│  │  │ - /projects │  │ - projCtrl  │  │ - tokens    │  │ - events    │  │  │
│  │  │ - /tasks    │  │ - taskCtrl  │  │ - logs      │  │ - rooms     │  │  │
│  │  │ - /logs     │  │ - logCtrl   │  │ - notifs    │  │             │  │  │
│  │  │ - /notifs   │  │ - notifCtrl │  │             │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     MongoDB (Mongoose ODM)                             │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Users     │  │  Projects   │  │   Tasks     │  │    Logs     │  │  │
│  │  │ - name      │  │ - name      │  │ - title     │  │ - title     │  │  │
│  │  │ - email     │  │ - members   │  │ - status    │  │ - type      │  │  │
│  │  │ - password  │  │ - ownedBy   │  │ - comments  │  │ - isRead    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  Sessions   │  │   Invites   │  │   Codes     │  │  TempUsers  │  │  │
│  │  │ - token     │  │ - inviteCode│  │ - code      │  │ - email     │  │  │
│  │  │ - device    │  │ - projectId │  │ - type      │  │ - expires   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Architecture

```
src/
├── api/                          # API Service Layer
│   ├── axiosInstance.js          # Configured Axios with interceptors
│   ├── authService.js            # Authentication API calls
│   ├── projectService.js         # Project CRUD operations
│   ├── taskService.js            # Task CRUD operations
│   ├── notificationService.js    # Notification management
│   ├── socketService.js          # WebSocket connection manager
│   └── index.js                  # API exports
│
├── components/                   # Reusable UI Components
│   ├── authentication/           # Login, Signup, Password Reset
│   ├── common/                   # Avatar, Card, Toast, etc.
│   ├── dashboard/                # Dashboard-specific widgets
│   ├── layout/                   # MainLayout, TopBar, SideBar
│   ├── projects/                 # Project cards, modals, forms
│   ├── tasks/                    # Task board, cards, modals
│   ├── tasksPageComponents/      # Tasks page specific components
│   └── settings/                 # Settings page components
│
├── hooks/                        # Custom React Hooks
│   ├── useDashboardData.js       # Dashboard data fetching
│   ├── useCalendar.js            # Calendar state management
│   └── useOptimizedDashboardData.js # Performance-optimized version
│
├── pages/                        # Route-level Components
│   ├── Dashboard.jsx             # Main dashboard view
│   ├── Projects.jsx              # Projects list page
│   ├── TasksPage.jsx             # Tasks overview page
│   ├── CalendarPage.jsx          # Calendar view
│   ├── Settings.jsx              # User settings
│   ├── NotificationsPage.jsx     # Full notifications page
│   └── Team.jsx                  # Team members view
│
└── utils/                        # Utility Functions
    ├── avatarUtils.js            # Avatar generation helpers
    ├── cacheManager.js           # Client-side caching
    ├── dateUtils.js              # Date formatting
    ├── userUtils.js              # User-related utilities
    ├── tasksDetailsStyles.js     # Task styling helpers
    └── requestDeduplicator.js    # Prevent duplicate API calls
```

### Backend Architecture

```
src/
├── config/                       # Configuration
│   ├── db.js                     # MongoDB connection
│   ├── env.js                    # Environment validation
│   └── socket.js                 # Socket.IO setup
│
├── controllers/                  # Request Handlers
│   ├── userController.js         # Auth & user management
│   ├── projectController.js      # Project operations
│   ├── taskController.js         # Task operations
│   ├── logController.js          # Activity logs
│   └── notificationController.js # Notification management
│
├── middlewares/                  # Express Middleware
│   ├── auth.js                   # JWT authentication
│   ├── rateLimiter.js            # Rate limiting
│   ├── inputValidation.js        # Request validation
│   ├── projectPermission.js      # Role-based access
│   ├── projectTask.js            # Task-project validation
│   ├── bodyCheck.js              # Request body validation
│   ├── passwordCheck.js          # Password verification
│   └── generalCheck.js           # Error handler
│
├── models/                       # Mongoose Schemas
│   ├── user.js                   # User model
│   ├── project.js                # Project model
│   ├── task.js                   # Task model (with comments)
│   ├── log.js                    # Notification/Log model
│   ├── session.js                # Session/Token model
│   ├── invite.js                 # Invitation model
│   ├── code.js                   # Verification codes
│   ├── tempUser.js               # Unverified users
│   └── revert.js                 # Email revert tokens
│
├── routes/                       # API Routes
│   ├── authRoutes.js             # /api/auth/*
│   ├── projectRoutes.js          # /api/projects/*
│   ├── taskRoutes.js             # /api/tasks/*
│   ├── logRoutes.js              # /api/logs/*
│   └── notificationRoutes.js     # /api/notifications/*
│
├── utils/                        # Utility Functions
│   ├── sendEmail.js              # Email service
│   ├── tokenGenerator.js         # JWT generation
│   ├── createLog.js              # Log creation helper
│   ├── createProjectNotification.js # Notification helpers
│   └── projectBelongCheck.js     # Membership validation
│
└── server.js                     # Application entry point
```

---

## Data Flow

### Request Flow (REST API)

```
Client Request
      │
      ▼
┌─────────────────────┐
│   axiosInstance     │  ← Attach token, cache check
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Express Server    │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   CORS Middleware   │  ← Validate origin
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Rate Limiter      │  ← Prevent abuse
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Body Parser       │  ← Parse JSON
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Auth Middleware   │  ← Verify JWT, attach user
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Validation        │  ← Validate input
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Permission Check  │  ← Verify access rights
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Controller        │  ← Business logic
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Mongoose Model    │  ← Database operation
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   MongoDB           │  ← Data persistence
└─────────────────────┘
```

### Real-time Flow (WebSocket)

```
Server Event (e.g., Task Created)
      │
      ▼
┌─────────────────────┐
│ createNotification  │  ← Create log entry
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Socket.IO Emit    │  ← Send to user room
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Client Socket     │  ← Receive event
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   onNotification()  │  ← Callback triggered
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│   UI Update         │  ← Toast + badge update
└─────────────────────┘
```

---

## Authentication Flow

### Registration Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Client  │        │  Server  │        │ Database │        │  Email   │
└────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │                   │
     │ POST /signup      │                   │                   │
     │──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │ Create TempUser   │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │ Save Code         │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │ Send Verification │                   │
     │                   │──────────────────────────────────────>│
     │                   │                   │                   │
     │   201 Created     │                   │                   │
     │<──────────────────│                   │                   │
     │                   │                   │                   │
     │ POST /verify      │                   │                   │
     │──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │ Verify Code       │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │ Create User       │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │ Create Session    │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │   200 + Token     │                   │                   │
     │<──────────────────│                   │                   │
```

### Login Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐
│  Client  │        │  Server  │        │ Database │
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │
     │ POST /login       │                   │
     │──────────────────>│                   │
     │                   │                   │
     │                   │ Find User         │
     │                   │──────────────────>│
     │                   │                   │
     │                   │ Compare Password  │
     │                   │ (bcrypt)          │
     │                   │                   │
     │                   │ Create Session    │
     │                   │──────────────────>│
     │                   │                   │
     │   200 + Token     │                   │
     │<──────────────────│                   │
     │                   │                   │
     │ Store in          │                   │
     │ localStorage      │                   │
```

---

## Security Architecture

### Authentication & Authorization

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| Transport | HTTPS | Encrypt data in transit |
| Token | JWT (30-day expiry) | Stateless authentication |
| Password | bcrypt (10 rounds) | Secure password storage |
| Session | Database-backed | Token invalidation support |
| CORS | Origin whitelist | Prevent CSRF |
| Rate Limiting | Express Rate Limit | Prevent brute force |

### Permission Levels

```
Level 0: No Access (not a member)
Level 1: Member (view, update assigned tasks)
Level 2: Admin (create/edit/delete tasks, manage members)
Level 3: Owner (all permissions + delete project, transfer ownership)
```

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General | 100 req | 15 min |
| Login | 5 req | 15 min |
| Signup | 8 req | 1 hour |
| Password Reset | 3 req | 1 hour |
| Password Reset Verify | 5 req | 15 min |
| Email Verification | 10 req | 1 hour |
| Password Change | 3 req | 1 hour |
| Email Change | 3 req | 24 hours |
| Password Change | 3 req | 1 hour |
| Email Change | 3 req | 24 hours |

---

## Scalability Considerations

### Current Design (Demo Scale: 50-100 users)

- Single MongoDB instance
- Single Node.js server
- In-memory Socket.IO

### Future Scaling Path

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Server 1   │    │  Server 2   │    │  Server 3   │
└─────────────┘    └─────────────┘    └─────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                  ┌─────────────────┐
                  │   Redis Adapter │  ← Socket.IO scaling
                  └─────────────────┘
                           │
                           ▼
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  MongoDB    │    │  MongoDB    │    │  MongoDB    │
│  Primary    │    │  Secondary  │    │  Secondary  │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## Technology Decisions

### Why MongoDB?
- Flexible schema for evolving requirements
- Embedded documents for comments (fast reads)
- Native support in Node.js ecosystem
- Easy horizontal scaling

### Why Socket.IO?
- Real-time bidirectional communication
- Automatic fallback for unsupported browsers
- Room-based broadcasting for user-specific events
- Built-in reconnection handling

### Why React?
- Component-based architecture
- Large ecosystem and community
- Efficient rendering with virtual DOM
- Rich state management options

### Why Tailwind CSS?
- Utility-first approach speeds development
- Highly customizable design system
- Excellent responsive design utilities
- Small production bundle with purging

---

*Last Updated: December 2025*
