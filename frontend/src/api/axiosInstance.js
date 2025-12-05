import axios from 'axios';

/**
 * Centralized Axios Instance Configuration
 * 
 * This file creates a pre-configured axios instance with:
 * - Base URL from environment variables
 * - Automatic token attachment
 * - Request/Response interceptors
 * - Centralized error handling
 */

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Attach token if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get device info for authentication endpoints
    if (config.url?.includes('/auth/login')  || config.url?.includes('/auth/signup') || config.url?.includes('/auth/reset-password/new' )|| config.url?.includes("/auth/verify-email")) {
      const deviceId = localStorage.getItem('deviceId') || (() => {
        const id = crypto.randomUUID();
        localStorage.setItem('deviceId', id);
        return id;
      })();

      config.headers['X-Device-Id'] = deviceId;
      config.headers['X-Device-Name'] = navigator.userAgentData?.brands?.[0]?.brand || navigator.userAgent;
      config.headers['X-Device-OsVersion'] = navigator.userAgentData?.platform || navigator.platform || 'Unknown OS';
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.group(
        `%c🔵 API Request: ${config.method.toUpperCase()} ${config.url}`,
        'color: #3b82f6; font-weight: bold;'
      );
      console.log('Full URL:', config.baseURL + config.url);
      console.log('Data:', config.data);
      console.log('Params:', config.params);
      console.log('Time:', new Date().toISOString());
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.group(
        `%c✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`,
        'color: #10b981; font-weight: bold;'
      );
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Time:', new Date().toISOString());
      console.groupEnd();
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.group(
        `%c❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        'color: #ef4444; font-weight: bold;'
      );
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
      console.log('Time:', new Date().toISOString());
      console.groupEnd();
    }

    // Handle specific error cases
    if (error.response) {
      const { status } = error.response;

      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already on a public route
        const publicRoutes = ['/login', '/signup', '/verify', '/reset-password', '/verify-reset'];
        const currentPath = window.location.pathname;
        
        if (!publicRoutes.some(route => currentPath.startsWith(route))) {
          window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden - Insufficient permissions
      if (status === 403) {
        // Could show a toast notification here
        console.warn('Access denied: Insufficient permissions');
      }

      // Handle 404 Not Found
      if (status === 404) {
        console.warn('Resource not found');
      }

      // Handle 500 Internal Server Error
      if (status === 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

