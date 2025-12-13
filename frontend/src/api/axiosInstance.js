import axios from 'axios';
import { cacheManager } from '../utils/cacheManager.js';

/**
 * Centralized Axios Instance Configuration
 * 
 * This file creates a pre-configured axios instance with:
 * - Base URL from environment variables
 * - Automatic token attachment
 * - Request/Response interceptors
 * - Built-in caching for GET requests
 * - Request deduplication to prevent duplicate calls
 * - Centralized error handling
 */

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Attach token, apply caching, and deduplication
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

    // Enable caching for GET requests (cache key: method + url + params)
    if (config.method === 'get') {
      const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
      
      // Check if response is cached
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        // Return cached data as a resolved promise
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (from cache)',
          headers: {},
          config: config,
        });
      }
      
      // Store cache key in config for response interceptor
      config.cacheKey = cacheKey;
    }

    // Enable request deduplication for all requests
    const dedupeKey = `${config.method}:${config.url}:${JSON.stringify(config.params || config.data || {})}`;
    config.dedupeKey = dedupeKey;

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
        const publicRoutes = ['/login', '/signup', '/verify', '/reset-password', '/verify-reset', '/projects'];
        const currentPath = window.location.pathname;
        
        // Don't redirect if on invitation page (starts with /projects)
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

