import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Calendar, Users, User } from "lucide-react";

// Import layout
import MainLayout from "./components/layout/MainLayout";

// Import authentication components
import SignupForm from "./components/authentication/SignupForm";
import VerificationForm from "./components/authentication/VerificationForm";
import LoginForm from "./components/authentication/LoginForm";
import RequestPasswordResetForm from "./components/authentication/RequestPasswordResetForm";
import PasswordResetFlow from "./components/authentication/PasswordResetFlow";

// Import pages
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import TasksPage from "./pages/TasksPage";
import Settings from "./pages/Settings";
import NotificationsPage from "./pages/NotificationsPage";
import Team from "./pages/Team";

// Import project components
import CreateProject from "./components/projects/CreateProject";
import EditProject from "./components/projects/EditProject";
import ProjectDetails from "./components/projects/ProjectDetails";
import AcceptInvite from "./components/projects/AcceptInvite";

// Import task components
import TaskList from "./components/tasks/TaskList";
import TaskDetail from "./components/tasks/TaskDetail";
import TaskBoard from "./components/tasks/TaskAssignment";

// Axios logging is now handled by axiosInstance interceptors

// Auth check
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Protected route wrapper - checks auth and redirects if needed
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public route wrapper - redirects to last page if already logged in
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const lastRoute = localStorage.getItem("lastRoute");
    return <Navigate to={lastRoute || "/dashboard"} replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ============================================ */}
        {/* PUBLIC ROUTES (Outside MainLayout)          */}
        {/* ============================================ */}

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication routes */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupForm />
            </PublicRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <PublicRoute>
              <VerificationForm />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />

        {/* Password Reset Flow */}
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <RequestPasswordResetForm />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-reset"
          element={
            <PublicRoute>
              <PasswordResetFlow />
            </PublicRoute>
          }
        />

        {/* Special invitation route (handles auth internally, full-page design) */}
        <Route
          path="/projects/:projectId/invite/:inviteId/:code"
          element={<AcceptInvite />}
        />

        {/* ============================================ */}
        {/* PROTECTED ROUTES (Inside MainLayout)        */}
        {/* ============================================ */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Projects Routes */}
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="projects/:projectId" element={<ProjectDetails />} />
          <Route path="projects/:projectId/edit" element={<EditProject />} />

          {/* Task Routes */}
          <Route path="projects/:projectId/tasks" element={<TaskList />} />
          <Route
            path="projects/:projectId/tasks/:taskId"
            element={<TaskDetail />}
          />
          <Route path="projects/:projectId/board" element={<TaskBoard />} />

          {/* Future routes - ready for expansion */}
          <Route
            path="tasks"
            element={<TasksPage />}
          />
          <Route
            path="notifications"
            element={<NotificationsPage />}
          />
          <Route
            path="calendar"
            element={
              <div className="max-w-4xl mx-auto text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Calendar
                </h1>
                <p className="text-gray-600">Coming Soon! 📅</p>
              </div>
            }
          />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="profile"
            element={
              <div className="max-w-4xl mx-auto text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Profile
                </h1>
                <p className="text-gray-600">Coming Soon! 👤</p>
              </div>
            }
          />
        </Route>

        {/* ============================================ */}
        {/* 404 - Catch All Route                       */}
        {/* ============================================ */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4">
              <div className="bg-white rounded-[25px] shadow-2xl p-12 max-w-md w-full text-center border-2 border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl font-bold text-white">404</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Page Not Found
                </h1>
                <p className="text-gray-600 mb-8">
                  The page you are looking for doesn't exist or has been moved.
                </p>
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="px-8 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-xl transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
