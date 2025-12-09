import { Server } from "socket.io";

let io = null;

// Map to track connected users: { odlkfj: 'socket-id', ... }
const connectedUsers = new Map();

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // User joins with their user ID
    socket.on("user:join", (userId) => {
      if (userId) {
        // Store the user's socket ID
        connectedUsers.set(userId, socket.id);
        // Join a room named after the user ID for targeted notifications
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] User ${userId} joined (socket: ${socket.id})`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Find and remove the user from connectedUsers
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`[Socket.IO] User ${userId} disconnected`);
          break;
        }
      }
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
