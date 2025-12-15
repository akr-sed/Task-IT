import { cleanEnv, str, port, url, email } from "envalid";
import dotenv from "dotenv";

// Allow skipping .env file loading for testing
if (process.env.SKIP_DOTENV !== "true") {
  dotenv.config();
}

const env = cleanEnv(process.env, {
  // Database
  MONGODB_URI: str({
    desc: "MongoDB connection string",
    example: "mongodb+srv://user:pass@cluster.mongodb.net/dbname",
  }),

  // Security
  SECRET: str({
    desc: "Secret key for JWT signing",
    example: "your-secret-key-here",
  }),

  // Server
  PORT: port({
    desc: "Server port",
    default: 5000,
  }),

  FRONTEND_URL: url({
    desc: "Frontend origin for CORS",
    example: "http://localhost:5173",
  }),

  // Email configuration
  EMAIL_USER: email({
    desc: "Email account for sending verification emails",
    example: "noreply@example.com",
  }),

  EMAIL_PASS: str({
    desc: "Email account password or app-specific password",
  }),
});

export default env;
