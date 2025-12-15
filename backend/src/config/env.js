// import { cleanEnv, str, port, url, email } from "envalid";
// import dotenv from "dotenv";

// // Allow skipping .env file loading for testing
// if (process.env.SKIP_DOTENV !== "true") {
//   dotenv.config();
// }

// const env = cleanEnv(process.env, {
//   // Database
//   MONGODB_URI: str({
//     desc: "MongoDB connection string",
//     example: "mongodb+srv://user:pass@cluster.mongodb.net/dbname",
//   }),

//   // Security
//   SECRET: str({
//     desc: "Secret key for JWT signing",
//     example: "your-secret-key-here",
//   }),

//   // Server
//   PORT: port({
//     desc: "Server port",
//     default: 5000,
//   }),

//   FRONTEND_URL: url({
//     desc: "Frontend origin for CORS",
//     example: "http://localhost:5173",
//   }),

//   // Email configuration
//   EMAIL_USER: email({
//     desc: "Email account for sending verification emails",
//     example: "noreply@example.com",
//   }),

//   EMAIL_PASS: str({
//     desc: "Email account password or app-specific password",
//   }),
// });

// export default env;
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

  // --- NEW GMAIL API CONFIGURATION ---
  
  // Sender Email (used as the 'From' address and for OAuth identity)
  EMAIL_USER: email({
    desc: "Email account for sending emails (must be the one authorized in Google OAuth)",
    example: "noreply@example.com",
  }),

  // OAuth Credentials (to replace EMAIL_PASS)
  CLIENT_ID: str({
    desc: "Google OAuth 2.0 Client ID for the Gmail API",
    example: "680056509242-k85tcevi3kgdv3jmis919fptflbh21ts.apps.googleusercontent.com",
  }),

  CLIENT_SECRET: str({
    desc: "Google OAuth 2.0 Client Secret for the Gmail API",
  }),

  REFRESH_TOKEN: str({
    desc: "Google OAuth Refresh Token for permanent access to the Gmail API (obtained via Playground/Flow)",
    // Note: The example value is shortened for display
    example: "1//04Ak_BXk...VDc234Lg", 
  }),

  REDIRECT_URI: url({
    desc: "The redirect URI used during OAuth authorization (e.g., the Playground URI or your server endpoint)",
    example: "https://developers.google.com/oauthplayground",
  }),

  // The following variables are now obsolete for the Gmail API and were REMOVED:
  // EMAIL_PASS: str({ ... }), 
});

export default env;