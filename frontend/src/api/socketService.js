import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "");

let socket = null;

// Local event emitter for cross-component communication
const localListeners = {
  "notification:deleted": [],
  "notification:read": [],
  "notification:allRead": [],
  "notification:allDeleted": [],
};

/**
 * Emit a local event (for cross-component sync)
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export function emitLocal(event, data) {
  if (localListeners[event]) {
    localListeners[event].forEach((callback) => callback(data));
  }
}

/**
 * Subscribe to a local event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onLocal(event, callback) {
  if (!localListeners[event]) {
    localListeners[event] = [];
  }
  localListeners[event].push(callback);

  return () => {
    localListeners[event] = localListeners[event].filter(
      (cb) => cb !== callback
    );
  };
}

/**
 * Initialize Socket.IO connection
 * @returns {Socket} Socket.IO client instance
 */
export function initializeSocket() {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[Socket.IO] Connected:", socket.id);

    // Join the user's room
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      socket.emit("user:join", user.id);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.IO] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket.IO] Connection error:", error.message);
  });

  return socket;
}

/**
 * Connect to the socket server
 */
export function connectSocket() {
  if (!socket) {
    initializeSocket();
  }

  if (!socket.connected) {
    socket.connect();

    // Re-join user room after reconnection
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      socket.emit("user:join", user.id);
    }
  }

  return socket;
}

/**
 * Disconnect from the socket server
 */
export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Get the socket instance
 * @returns {Socket|null}
 */
export function getSocket() {
  return socket;
}

/**
 * Subscribe to a notification event
 * @param {Function} callback - Function to call when notification received
 * @returns {Function} Unsubscribe function
 */
export function onNotification(callback) {
  if (!socket) {
    initializeSocket();
  }

  socket.on("notification:new", callback);

  // Return unsubscribe function
  return () => {
    socket.off("notification:new", callback);
  };
}

export default {
  initializeSocket,
  connectSocket,
  disconnectSocket,
  getSocket,
  onNotification,
  emitLocal,
  onLocal,
};
