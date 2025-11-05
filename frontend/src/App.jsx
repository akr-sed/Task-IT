import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
          element={<PublicRoute>{/* <SignupForm /> */}</PublicRoute>}
        />
        <Route
          path="/verify"
          element={<PublicRoute>{/* <VerificationForm /> */}</PublicRoute>}
        />
        <Route
          path="/login"
          element={<PublicRoute>{/* <LoginForm /> */}</PublicRoute>}
        />

        {/* Password Reset Flow */}
        <Route
          path="/reset-password"
          element={
            <PublicRoute>{/* <RequestPasswordResetForm /> */}</PublicRoute>
          }
        />
        <Route
          path="/verify-reset"
          element={<PublicRoute>{/* <PasswordResetFlow /> */}</PublicRoute>}
        />

        {/* Special invitation route (handles auth internally, full-page design) */}
        <Route
          path="/projects/:projectId/invite/:inviteId/:code"
          // element={<AcceptInvite />}
        />

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
