import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";

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
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", authRouter)

connectDB().then(() => {
  const mongoUsername = extractMongoUsername(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB as user: ${mongoUsername}`);
  app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`);
  });
});

app.use(generalCheck); // auto catch errors

