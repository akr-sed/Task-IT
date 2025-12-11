import express from "express";
import cors from "cors";
import { createServer } from "http";
import { connectDB } from "./config/db.js";
import { initializeSocket } from "./config/socket.js";
import authRouter from "./routes/authRoutes.js";
import generalCheck from "./middlewares/generalCheck.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import logRouter from "./routes/logRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
const extractMongoUsername = (uri) => {
  try {
    const regex = /mongodb(?:\+srv)?:\/\/([^:]+):/;
    const match = uri.match(regex);
    return match ? match[1] : "Unknown User";
  } catch (err) {
    return "Unknown User";
  }
};

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(generalLimiter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/logs", logRouter);
app.use("/api/notifications", notificationRouter);

connectDB().then(() => {
  const mongoUsername = extractMongoUsername(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB as user: ${mongoUsername}`);
  httpServer.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
    console.log(`Socket.IO ready for connections`);
  });
});

app.use(generalCheck); // auto catch errors
