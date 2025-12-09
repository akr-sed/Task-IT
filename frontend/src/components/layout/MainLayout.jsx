import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../api';
import { connectSocket, disconnectSocket, onNotification } from '../../api/socketService';
import TopBar from './TopBar';
import SideBar from './SideBar';
import NotificationToast from '../common/NotificationToast';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toasts, setToasts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }

    // Save current route to localStorage for refresh persistence
    localStorage.setItem('lastRoute', location.pathname);
  }, [location, navigate]);

  // Connect to Socket.IO and listen for real-time notifications
  useEffect(() => {
    if (!user) return;
    
    // Connect to socket server
    connectSocket();
    
    // Subscribe to new notifications
    const unsubscribe = onNotification((notification) => {
      console.log('[Socket.IO] New notification received:', notification);
      
      // Add to toasts (show max 5, newest first)
      setToasts(prev => [notification, ...prev].slice(0, 5));
    });
    
    // Cleanup on unmount or user change
    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, [user]);

  // Remove toast by ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => (t._id || t.id) !== id));
  }, []);

  // Handle toast click - navigate to notification
  const handleToastClick = useCallback((notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const token = localStorage.getItem('token');
      
      // ✅ Send logout request to server
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      console.error('Error during logout:', err);
      // Even if server logout fails, still clear local storage
    } finally {
      // ✅ Clear all local storage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastRoute');
      
      // ✅ Clear any cached data
      sessionStorage.clear();
      
      // ✅ Navigate to login
      navigate('/login', { replace: true });
      
      setLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5]">
      {/* Mobile Backdrop - Only show on mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed SideBar - Full Height, overlay on mobile */}
      <SideBar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        currentPath={location.pathname}
      />

      {/* Main Content Area - Takes remaining space */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* TopBar - Only spans the content area */}
        <TopBar 
          user={user} 
          onLogout={handleLogout} 
          loggingOut={loggingOut}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3 sm:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Loading Overlay */}
      {loggingOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold text-base sm:text-lg">Logging out...</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">Please wait</p>
          </div>
        </div>
      )}

      {/* Notification Toasts */}
      <NotificationToast 
        toasts={toasts} 
        onRemove={removeToast} 
        onToastClick={handleToastClick} 
      />
    </div>
  );
};

export default MainLayout;