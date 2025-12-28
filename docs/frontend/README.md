# 🎨 Frontend Documentation

## Overview

TaskIT's frontend is built with React 19.1 and Vite 7.1, featuring a modern component-based architecture with Tailwind CSS for styling.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Routing](#routing)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Real-time Updates](#real-time-updates)
- [Styling](#styling)
- [Best Practices](#best-practices)

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI library |
| React Router | 7.9.4 | Client-side routing |
| Vite | 7.1.7 | Build tool & dev server |
| Tailwind CSS | 3.4.18 | Utility-first CSS |
| Axios | 1.12.2 | HTTP client |
| Socket.IO Client | 4.8.1 | Real-time communication |
| Lucide React | 0.555.0 | Icon library |

---

## Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── main.jsx           # Application entry point
│   ├── App.jsx            # Root component with routing
│   ├── index.css          # Global styles + Tailwind
│   │
│   ├── api/               # API services
│   │   ├── index.js       # Service exports
│   │   ├── axiosInstance.js
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   ├── taskService.js
│   │   ├── notificationService.js
│   │   └── socketService.js
│   │
│   ├── assets/            # Static assets
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── components/        # Reusable components
│   │   ├── authentication/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── settings/
│   │   └── tasks/
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useCalendar.js
│   │   ├── useDashboardData.js
│   │   └── useOptimizedDashboardData.js
│   │
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── TasksPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── Settings.jsx
│   │   ├── Team.jsx
│   │   └── NotificationsPage.jsx
│   │
│   └── utils/             # Helper functions
│       ├── avatarUtils.js
│       ├── cacheManager.js
│       ├── dateUtils.js
│       └── userUtils.js
│
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── package.json
```

---

## Component Architecture

### Component Categories

#### 1. Layout Components
```
components/layout/
├── MainLayout.jsx    # Main app wrapper with sidebar
├── SideBar.jsx       # Navigation sidebar
└── TopBar.jsx        # Header with user menu
```

**MainLayout.jsx** wraps all authenticated pages:
- Manages sidebar state
- Handles logout
- Connects Socket.IO for notifications
- Renders notification toasts

#### 2. Authentication Components
```
components/authentication/
├── LoginForm.jsx              # Login page
├── SignupForm.jsx             # Registration page
├── VerificationForm.jsx       # Email verification
├── RequestPasswordResetForm.jsx
└── PasswordResetFlow.jsx
```

#### 3. Common Components
```
components/common/
├── Avatar.jsx             # User avatar with fallback
├── Card.jsx               # Reusable card container
├── EmptyState.jsx         # Empty state display
├── NotificationDropdown.jsx
└── NotificationToast.jsx  # Real-time notification popups
```

#### 4. Feature Components
```
components/projects/
├── CreateProject.jsx
├── EditProject.jsx
├── ProjectDetails.jsx
└── AcceptInvite.jsx

components/tasks/
├── TaskList.jsx
├── TaskDetail.jsx
└── TaskAssignment.jsx

components/dashboard/
├── cards/              # Dashboard stat cards
├── shared/             # Shared dashboard elements
└── index.js            # Export all dashboard components
```

### Component Patterns

#### Functional Components with Hooks
```jsx
import React, { useState, useEffect, useCallback } from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = useCallback(() => {
    // Event handler
  }, [dependencies]);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

#### Props Destructuring
```jsx
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  // Component logic
};
```

---

## Routing

### Route Structure

```jsx
// App.jsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
  <Route path="/signup" element={<PublicRoute><SignupForm /></PublicRoute>} />
  <Route path="/verify" element={<VerificationForm />} />
  <Route path="/reset-password" element={<PasswordResetFlow />} />
  
  {/* Protected Routes (inside MainLayout) */}
  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/projects/new" element={<CreateProject />} />
    <Route path="/projects/:id" element={<ProjectDetails />} />
    <Route path="/projects/:id/edit" element={<EditProject />} />
    <Route path="/projects/:id/tasks" element={<TasksPage />} />
    <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/team" element={<Team />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/notifications" element={<NotificationsPage />} />
  </Route>
</Routes>
```

### Route Protection

**ProtectedRoute:**
```jsx
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
```

**PublicRoute:**
```jsx
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const lastRoute = localStorage.getItem('lastRoute');
    return <Navigate to={lastRoute || '/dashboard'} replace />;
  }
  return children;
};
```

### Authentication Check

```jsx
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};
```

---

## State Management

TaskIT uses React's built-in state management with hooks:

### Local State
```jsx
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);
```

### Shared State via Props
```jsx
<TaskList 
  tasks={tasks} 
  onTaskSelect={handleTaskSelect}
  onTaskDelete={handleDelete}
/>
```

### Custom Hooks for Complex State

**useDashboardData Hook:**
```jsx
export const useDashboardData = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    
    // Parallel fetch for performance
    const [projectsResponse, invitesResponse] = await Promise.allSettled([
      projectService.getAllProjects(),
      projectService.getMyInvitations(),
    ]);
    
    // Process responses...
    
    setLoading(false);
  }, []);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  return {
    projects,
    tasks,
    loading,
    refetch: fetchDashboardData
  };
};
```

### Local Storage for Persistence

```jsx
// Store user data
localStorage.setItem('user', JSON.stringify(userData));
localStorage.setItem('token', authToken);

// Retrieve user data
const user = JSON.parse(localStorage.getItem('user'));

// Remember last route
localStorage.setItem('lastRoute', location.pathname);
```

---

## API Integration

### Axios Instance

```javascript
// api/axiosInstance.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

### Service Layer Pattern

```javascript
// api/projectService.js
import API from './axiosInstance';

export const projectService = {
  getAllProjects: () => API.get('/api/projects'),
  
  getProjectById: (id) => API.get(`/api/projects/${id}`),
  
  createProject: (data) => API.post('/api/projects', data),
  
  updateProject: (id, data) => API.put(`/api/projects/${id}`, data),
  
  deleteProject: (id) => API.delete(`/api/projects/${id}`),
  
  inviteMember: (projectId, email) => 
    API.post(`/api/projects/${projectId}/invite`, { email }),
};
```

### Using Services in Components

```jsx
import { projectService, taskService } from '../api';

const fetchData = async () => {
  try {
    const response = await projectService.getAllProjects();
    setProjects(response.data.projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    setError(error.message);
  }
};
```

---

## Real-time Updates

### Socket.IO Integration

```javascript
// api/socketService.js
import { io } from 'socket.io-client';

let socket = null;
const listeners = new Set();

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  
  socket = io(import.meta.env.VITE_API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  
  socket.on('connect', () => {
    console.log('[Socket.IO] Connected');
  });
  
  socket.on('notification', (data) => {
    listeners.forEach(callback => callback(data));
  });
};

export const onNotification = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Using Socket in Components

```jsx
// MainLayout.jsx
useEffect(() => {
  if (!user) return;
  
  connectSocket();
  
  const unsubscribe = onNotification((notification) => {
    setToasts(prev => [notification, ...prev].slice(0, 5));
  });
  
  return () => {
    unsubscribe();
    disconnectSocket();
  };
}, [user]);
```

---

## Styling

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... color scale
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};
```

### Component Styling Pattern

```jsx
const Card = ({ children, className = '' }) => {
  return (
    <div className={`
      bg-white 
      rounded-lg 
      shadow-sm 
      border 
      border-gray-200 
      p-4 
      ${className}
    `}>
      {children}
    </div>
  );
};
```

### Responsive Design

```jsx
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  {/* Cards */}
</div>
```

### Conditional Classes

```jsx
<button
  className={`
    px-4 py-2 rounded-md
    ${isActive 
      ? 'bg-blue-600 text-white' 
      : 'bg-gray-100 text-gray-700'
    }
    ${isDisabled && 'opacity-50 cursor-not-allowed'}
  `}
>
  Button
</button>
```

---

## Best Practices

### 1. Component Organization

- One component per file
- Group related components in folders
- Use index.js for clean exports

```javascript
// components/dashboard/index.js
export { default as StatsCard } from './cards/StatsCard';
export { default as ProjectCard } from './cards/ProjectCard';
export { default as TasksOverview } from './shared/TasksOverview';
```

### 2. Error Handling

```jsx
const [error, setError] = useState(null);

try {
  const response = await api.fetchData();
  setData(response.data);
} catch (err) {
  setError(err.response?.data?.message || 'An error occurred');
} finally {
  setLoading(false);
}

// Render error state
{error && (
  <div className="text-red-600 p-4 bg-red-50 rounded">
    {error}
  </div>
)}
```

### 3. Loading States

```jsx
if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
```

### 4. Performance Optimization

```jsx
// Memoize callbacks
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Memoize expensive computations
const filteredTasks = useMemo(() => {
  return tasks.filter(t => t.status === filter);
}, [tasks, filter]);

// Prevent unnecessary re-renders
const MemoizedComponent = React.memo(MyComponent);
```

### 5. Accessibility

```jsx
<button
  onClick={handleAction}
  aria-label="Close dialog"
  className="..."
>
  <XIcon className="h-5 w-5" />
</button>

<input
  type="text"
  id="task-title"
  aria-describedby="title-help"
  className="..."
/>
<p id="title-help" className="text-sm text-gray-500">
  Enter a descriptive title
</p>
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Environment Variables

```env
# .env.local
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

*Last Updated: December 2025*
