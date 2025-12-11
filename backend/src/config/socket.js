import { Server } from "socket.io";

let io = null;
let cleanupTimer = null;

// Bidirectional tracking for safer cleanup
const connectedUsers = new Map(); // userId -> Set<socketId>
const socketToUser = new Map();   // socketId -> userId

const registerSocket = (userId, socket) => {
  if (!userId) return;
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId).add(socket.id);
  socketToUser.set(socket.id, userId);
  socket.join(`user:${userId}`);
};

const removeSocket = (socketId) => {
  const userId = socketToUser.get(socketId);
  if (!userId) return;

  socketToUser.delete(socketId);
  const sockets = connectedUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      connectedUsers.delete(userId);
    }
  }
};

export const performCleanup = () => {
  // If Socket.IO is gone, drop all mappings
  if (!io || !io.sockets) {
    connectedUsers.clear();
    socketToUser.clear();
    return;
  }

  const liveSockets = io.sockets.sockets;

  for (const [socketId, userId] of socketToUser.entries()) {
    const socketInstance = liveSockets.get(socketId);
    const isGone = !socketInstance || socketInstance.disconnected;

    if (isGone) {
      socketToUser.delete(socketId);
      const sockets = connectedUsers.get(userId);
      if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          connectedUsers.delete(userId);
        }
      }
    }
  }
};

export const shutdownSocket = () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  if (io) {
    io.close();
    io = null;
  }
  connectedUsers.clear();
  socketToUser.clear();
};

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export function initializeSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Periodic cleanup to avoid lingering sockets
  cleanupTimer = setInterval(performCleanup, 5 * 60 * 1000);

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // User joins with their user ID
    socket.on("user:join", (userId) => {
      registerSocket(userId, socket);
      console.log(`[Socket.IO] User ${userId} joined (socket: ${socket.id})`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      removeSocket(socket.id);
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[Socket.IO] Server initialized");
  return io;
}

/**
 * Get the Socket.IO server instance
 * @returns {Server|null} Socket.IO server instance
 */
export function getIO() {
  return io;
}

// Expose state for tests/diagnostics
export function getConnectionState() {
  return {
    users: Array.from(connectedUsers.entries()).map(([userId, sockets]) => ({
      userId,
      sockets: Array.from(sockets),
    })),
    socketCount: socketToUser.size,
  };
}

/**
 * Emit a notification to a specific user
 * @param {string} userId - The user ID to send the notification to
 * @param {Object} notification - The notification object
 */
export function emitToUser(userId, event, data) {
  if (!io) {
    console.warn("[Socket.IO] Server not initialized");
    return;
  }

  // Emit to the user's room
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit a notification to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {string} event - Event name
 * @param {Object} data - Data to emit
 */
export function emitToUsers(userIds, event, data) {
  if (!io) {
    console.warn("[Socket.IO] Server not initialized");
    return;
  }

  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit(event, data);
  });
}

/**
 * Check if a user is currently connected
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is connected
 */
export function isUserConnected(userId) {
  return connectedUsers.has(userId);
}

export default {
  initializeSocket,
  getIO,
  emitToUser,
  emitToUsers,
  isUserConnected,
};
