# 📋 TaskIT - Project & Task Management Platform

<div align="center">

![TaskIT Logo](frontend/public/logo.png)

**A modern, collaborative task and project management platform built with the MERN stack**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 🎯 Overview

TaskIT is a web-based task management application designed for teams, students, and professionals who need a simple yet powerful way to organize projects, assign tasks, and track progress. Initially optimized for students managing coursework and group projects, the system is equally suited to small teams, freelancers, startups, and agencies.

### Key Features

- 🔐 **Secure Authentication** - Email verification, password reset, JWT-based sessions
- 📁 **Project Management** - Create, edit, and organize multiple projects
- ✅ **Task Tracking** - Create tasks with priorities, due dates, and status tracking
- 👥 **Team Collaboration** - Invite members, assign roles (Owner/Admin/Member)
- 🔔 **Real-time Notifications** - Socket.IO powered instant updates
- 📊 **Dashboard Analytics** - Visual progress tracking with charts
- 📅 **Calendar View** - See tasks organized by due dates
- 💬 **Task Comments** - Collaborate with contextual discussions

---

## 🏗️ Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Pages      │  │  Components  │  │   Services (API)     │   │
│  │  - Dashboard │  │  - Layout    │  │  - authService       │   │
│  │  - Projects  │  │  - Tasks     │  │  - projectService    │   │
│  │  - Tasks     │  │  - Projects  │  │  - taskService       │   │
│  │  - Calendar  │  │  - Common    │  │  - notificationSvc   │   │
│  │  - Settings  │  │  - Dashboard │  │  - socketService     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                              │                                    │
│                    Axios Instance (HTTP + Cache)                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API + WebSocket
┌──────────────────────────────┴──────────────────────────────────┐
│                      Backend (Node.js + Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Routes     │  │ Controllers  │  │    Middlewares       │   │
│  │  - auth      │  │  - user      │  │  - auth (JWT)        │   │
│  │  - projects  │  │  - project   │  │  - rateLimiter       │   │
│  │  - tasks     │  │  - task      │  │  - validation        │   │
│  │  - logs      │  │  - log       │  │  - permissions       │   │
│  │  - notifs    │  │  - notif     │  │  - bodyCheck         │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                              │                                    │
│                    Socket.IO (Real-time Events)                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                     MongoDB (Database)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Users  │ │Projects │ │  Tasks  │ │  Logs   │ │ Invites │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │Sessions │ │  Codes  │ │TempUsers│                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **MongoDB** (Atlas recommended for development)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akr-sed/Taskit.git
   cd Taskit
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   
   Create `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskit
   SECRET=your-jwt-secret-key
   FRONTEND_URL=http://localhost:5173
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-app-password
   ```

   Create `.env` file in the `frontend/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

---

## 📂 Project Structure

```
Task-IT/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/             # DB, env, socket configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middlewares/        # Auth, validation, rate limiting
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API route definitions
│   │   ├── utils/              # Helper functions
│   │   └── server.js           # Entry point
│   └── package.json
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── api/                # API service modules
│   │   ├── assets/             # Static assets
│   │   ├── components/         # Reusable components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   └── package.json
│
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── database/               # Database schema docs
│   └── frontend/               # Frontend architecture docs
│
├── README.md                   # This file
├── Product Backlog.md          # User stories & backlog
├── Sprint Backlog.md           # Sprint planning template
├── Increment.md                # Sprint deliverables
└── Definition of Done.md       # Quality standards
```

---

## 🔧 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI library |
| Vite | 7.x | Build tool |
| Tailwind CSS | 3.4 | Styling |
| React Router | 7.x | Navigation |
| Axios | 1.12 | HTTP client |
| Socket.IO Client | 4.8 | Real-time communication |
| Lucide React | 0.555 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18 | Web framework |
| MongoDB | 8+ | Database |
| Mongoose | 8.14 | ODM |
| Socket.IO | 4.8 | Real-time events |
| JWT | 9.x | Authentication |
| bcrypt | 6.x | Password hashing |
| Nodemailer | 7.x | Email service |

---

## 👥 User Roles & Permissions

| Action | Owner | Admin | Member |
|--------|:-----:|:-----:|:------:|
| View project | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ❌ |
| Edit tasks | ✅ | ✅ | ❌ |
| Delete tasks | ✅ | ✅ | ❌ |
| Update task status | ✅ | ✅ | ✅* |
| Comment on tasks | ✅ | ✅ | ✅ |
| Invite members | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ |
| Manage roles | ✅ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |

*Members can only update status on tasks assigned to them

---

## 📖 Documentation

For detailed documentation, see:

- **[Product Backlog](./Product%20Backlog.md)** - User stories and features
- **[Definition of Done](./Definition%20of%20Done.md)** - Quality standards
- **[Architecture](./docs/architecture.md)** - System design details
- **[API Reference](./docs/api/)** - Complete API documentation
- **[Database Schema](./docs/database/)** - Data models and relationships
- **[Setup Guide](./docs/setup.md)** - Detailed installation instructions
- **[Deployment](./docs/deployment.md)** - Production deployment guide

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Team

Built with by the TaskIT Team at ENSIA.

---

<div align="center">

**[⬆ Back to Top](#-taskit---project--task-management-platform)**

</div>
