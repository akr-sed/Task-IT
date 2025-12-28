# 🛠️ Development Setup Guide

Complete guide to set up TaskIT for local development.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Gmail API Setup](#gmail-api-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or higher | Runtime |
| npm | 9.x or higher | Package manager |
| Git | 2.x or higher | Version control |
| MongoDB | 7.x or higher (or Atlas) | Database |

### Recommended Tools

- **VS Code** - Recommended IDE
- **MongoDB Compass** - GUI for database management
- **Postman** - API testing

### Verify Installation

```bash
node --version    # v18.x.x or higher
npm --version     # 9.x.x or higher
git --version     # 2.x.x or higher
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/akr-sed/Taskit.git
cd Taskit

# 2. Install all dependencies
npm install --prefix backend
npm install --prefix frontend

# 3. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# 4. Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## Backend Setup

### 1. Navigate to Backend

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Dependencies Overview

```json
{
  "dependencies": {
    "express": "^4.18.2",      // Web framework
    "mongoose": "^8.14.3",     // MongoDB ODM
    "socket.io": "^4.8.1",     // Real-time communication
    "bcrypt": "^6.0.0",        // Password hashing
    "jsonwebtoken": "^9.0.2",  // JWT authentication
    "nodemailer": "^7.0.9",    // Email sending
    "cors": "^2.8.5",          // Cross-origin requests
    "dotenv": "^17.2.3",       // Environment variables
    "envalid": "^8.1.1"        // Environment validation
  },
  "devDependencies": {
    "nodemon": "^3.1.10"       // Auto-restart on changes
  }
}
```

### 4. Project Structure

```
backend/
├── src/
│   ├── server.js          # Application entry point
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   ├── env.js         # Environment validation
│   │   └── socket.js      # Socket.IO setup
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Express middlewares
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   └── utils/             # Helper functions
└── package.json
```

---

## Frontend Setup

### 1. Navigate to Frontend

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Dependencies Overview

```json
{
  "dependencies": {
    "react": "^19.1.1",              // UI library
    "react-dom": "^19.1.1",          // React DOM
    "react-router": "^7.9.4",        // Routing
    "axios": "^1.12.2",              // HTTP client
    "socket.io-client": "^4.8.1",    // Real-time client
    "lucide-react": "^0.555.0"       // Icons
  },
  "devDependencies": {
    "vite": "^7.1.7",                // Build tool
    "tailwindcss": "^3.4.18",        // CSS framework
    "@vitejs/plugin-react": "^5.0.4" // Vite React plugin
  }
}
```

### 4. Project Structure

```
frontend/
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Root component
│   ├── index.css          # Global styles
│   ├── api/               # API services
│   ├── assets/            # Static assets
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   └── utils/             # Helper functions
├── public/                # Static files
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json
```

---

## Environment Variables

### Backend `.env` File

Create `backend/.env` with the following variables:

```env
# ===================
# SERVER CONFIGURATION
# ===================
PORT=5000

# ===================
# DATABASE
# ===================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskit?retryWrites=true&w=majority

# ===================
# SECURITY
# ===================
SECRET=your-super-secret-jwt-signing-key-here

# ===================
# FRONTEND URL
# ===================
FRONTEND_URL=http://localhost:5173

# ===================
# EMAIL (Gmail API OAuth)
# ===================
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
CLIENT_SECRET=your-google-oauth-client-secret
REFRESH_TOKEN=your-oauth-refresh-token
REDIRECT_URI=https://developers.google.com/oauthplayground
```

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: 5000) | `5000` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `SECRET` | Yes | JWT signing secret key | `random-secure-string` |
| `FRONTEND_URL` | Yes | Frontend URL for CORS | `http://localhost:5173` |
| `EMAIL_USER` | Yes | Gmail sender address | `noreply@example.com` |
| `CLIENT_ID` | Yes | Google OAuth Client ID | `*.apps.googleusercontent.com` |
| `CLIENT_SECRET` | Yes | Google OAuth Client Secret | `GOCSPX-...` |
| `REFRESH_TOKEN` | Yes | Google OAuth Refresh Token | `1//04...` |
| `REDIRECT_URI` | Yes | OAuth redirect URI | `https://developers.google.com/oauthplayground` |

### Frontend Environment (Optional)

Vite reads environment variables from `.env` files. For custom API URL:

```env
# frontend/.env.local
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user with password
4. Whitelist your IP address
5. Get connection string and add to `.env`

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskit?retryWrites=true&w=majority
```

### Option 2: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use local connection string

```env
MONGODB_URI=mongodb://localhost:27017/taskit
```

### Database Initialization

Collections are created automatically when:
- First user registers (users collection)
- First project created (projects collection)
- First task created (tasks collection)

### Indexes

Indexes are defined in Mongoose schemas and created on first connection.

---

## Gmail API Setup

TaskIT uses Gmail API with OAuth 2.0 for sending emails.

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Gmail API

### Step 2: Configure OAuth Consent Screen

1. Go to APIs & Services → OAuth consent screen
2. Select "External" user type
3. Fill in app information
4. Add scopes: `https://mail.google.com/`
5. Add test users (your email)

### Step 3: Create OAuth Credentials

1. Go to APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Select "Web application"
4. Add authorized redirect URI:
   ```
   https://developers.google.com/oauthplayground
   ```
5. Copy Client ID and Client Secret

### Step 4: Get Refresh Token

1. Go to [OAuth Playground](https://developers.google.com/oauthplayground)
2. Click gear icon → Use your own OAuth credentials
3. Enter Client ID and Client Secret
4. In left panel, select Gmail API v1 → `https://mail.google.com/`
5. Click "Authorize APIs"
6. Login and grant permissions
7. Click "Exchange authorization code for tokens"
8. Copy the Refresh Token

### Step 5: Update `.env`

```env
EMAIL_USER=your-authorized-gmail@gmail.com
CLIENT_ID=your-client-id.apps.googleusercontent.com
CLIENT_SECRET=your-client-secret
REFRESH_TOKEN=1//04your-refresh-token
REDIRECT_URI=https://developers.google.com/oauthplayground
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Expected Output

**Backend:**
```
🔗 Connected to MongoDB
🚀 Server running on port 5000
```

**Frontend:**
```
  VITE v7.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Socket.IO | http://localhost:5000 |

---

## Development Workflow

### Git Branching

```bash
# Always start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your changes...

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Convention

```
type: description

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Formatting
- refactor: Code restructuring
- test:     Tests
- chore:    Build/tooling
```

### Code Style

- Use Prettier for formatting
- ESLint for linting
- Follow existing patterns

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `MONGODB_URI undefined` | Check `.env` file exists in backend folder |
| `ECONNREFUSED` | MongoDB not running or IP not whitelisted |
| `Authentication failed` | Check MongoDB credentials |
| `Cannot find module` | Run `npm install` in affected folder |
| `CORS error` | Check `FRONTEND_URL` matches actual frontend URL |
| `Email not sending` | Verify Gmail OAuth setup and tokens |

### Port Already in Use

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <pid> /F
```

### Reset Database

```bash
# Connect to MongoDB and drop database
mongosh
use taskit
db.dropDatabase()
```

### Debug Mode

Add to backend `.env`:
```env
DEBUG=true
```

---

## VS Code Extensions

Recommended extensions for development:

- **ESLint** - Linting
- **Prettier** - Formatting
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **MongoDB for VS Code** - Database explorer
- **REST Client** - API testing

---

## Next Steps

- Review [Architecture](architecture.md) for system design
- Read [API Documentation](api/) for endpoint details
- Check [Database Schema](database/schema.md) for data models
- See [Deployment Guide](deployment.md) for production setup

---

*Last Updated: December 2025*
