# 🚀 Deployment Guide

Complete guide to deploying TaskIT to production environments.

---

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Alternative: Railway Deployment](#alternative-railway-deployment)
- [Database (MongoDB Atlas)](#database-mongodb-atlas)
- [Environment Configuration](#environment-configuration)
- [Domain & SSL](#domain--ssl)
- [Monitoring](#monitoring)
- [CI/CD Pipeline](#cicd-pipeline)
- [Rollback Procedures](#rollback-procedures)

---

## Overview

### Recommended Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Vercel      │────▶│     Render      │────▶│  MongoDB Atlas  │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │ WebSocket
        └───────────────────────┘
```

### Services Stack

| Component | Recommended Platform | Alternative |
|-----------|---------------------|-------------|
| Frontend | Vercel | Netlify, Cloudflare Pages |
| Backend | Render | Railway, Fly.io, Heroku |
| Database | MongoDB Atlas | MongoDB on VM |
| File Storage | Cloudinary | AWS S3 |

---

## Pre-Deployment Checklist

### Security

- [ ] All secrets removed from code
- [ ] Environment variables configured
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Secure JWT secret (256+ bits)
- [ ] HTTPS enforced

### Code

- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Build completes without errors

### Database

- [ ] Production database created
- [ ] Indexes created
- [ ] Connection string updated
- [ ] Backup strategy in place

### Environment

- [ ] All environment variables documented
- [ ] Production values ready
- [ ] Email service configured

---

## Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select the TaskIT repository

### Step 2: Configure Project

```
Root Directory: ./
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Framework Preset: Vite
```

### Step 3: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-domain.onrender.com
VITE_SOCKET_URL=https://your-backend-domain.onrender.com
```

### Step 4: Deploy

Click "Deploy" and wait for build completion.

### vercel.json Configuration

The project includes a `vercel.json` for SPA routing:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Custom Domain

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS at your registrar:
   - CNAME record: `www` → `cname.vercel-dns.com`
   - A record: `@` → `76.76.19.19`

---

## Backend Deployment (Render)

### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Service

```
Name: taskit-api
Region: Choose nearest to users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node src/server.js
```

### Step 3: Set Environment Variables

In Render Dashboard → Environment:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Gmail OAuth
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-google-client-id
CLIENT_SECRET=your-google-client-secret
REFRESH_TOKEN=your-google-refresh-token
REDIRECT_URI=https://developers.google.com/oauthplayground
```

### Step 4: Deploy

Render auto-deploys on push to main branch.

### Health Check

Configure health check endpoint:
- Path: `/api/health`
- Interval: 30 seconds

Add health endpoint to backend:

```javascript
// In server.js
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

---

## Alternative: Railway Deployment

### Backend on Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub

```yaml
# railway.toml (optional)
[build]
builder = "NIXPACKS"
buildCommand = "npm install"

[deploy]
startCommand = "node src/server.js"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

### Environment Variables

Same as Render configuration.

---

## Database (MongoDB Atlas)

### Create Production Cluster

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new project "TaskIT-Production"
3. Build a cluster (M10 or higher recommended)
4. Choose cloud provider and region

### Configure Network Access

1. Go to Network Access
2. Add IP Address:
   - For Render: Add `0.0.0.0/0` (allow all)
   - For Railway: Add specific IPs from docs

### Create Database User

1. Go to Database Access
2. Create new user with read/write access
3. Use strong generated password

### Get Connection String

1. Click "Connect" on cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with actual password

```
mongodb+srv://username:password@cluster.mongodb.net/taskit_prod?retryWrites=true&w=majority
```

### Create Indexes

Run in MongoDB shell or Compass:

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ resetToken: 1 }, { sparse: true })

// Projects
db.projects.createIndex({ ownedBy: 1 })
db.projects.createIndex({ "members.id": 1 })

// Tasks
db.tasks.createIndex({ projectId: 1, status: 1 })
db.tasks.createIndex({ projectId: 1, assignedTo: 1 })
db.tasks.createIndex({ assignedTo: 1 })

// Logs
db.logs.createIndex({ userAssigned: 1, createdAt: -1 })
```

### Backup Configuration

1. Enable Cloud Backup (M10+)
2. Configure backup schedule
3. Set retention policy

---

## Environment Configuration

### Production Environment Variables

#### Backend

| Variable | Production Value |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | Platform default or `10000` |
| `MONGODB_URI` | Production Atlas connection string |
| `SECRET` | Strong random string (256+ bits) |
| `FRONTEND_URL` | `https://your-domain.vercel.app` |

#### Frontend (Build-time)

| Variable | Production Value |
|----------|------------------|
| `VITE_API_URL` | `https://your-api.onrender.com` |
| `VITE_SOCKET_URL` | `https://your-api.onrender.com` |

### Generate Secure Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

---

## Domain & SSL

### Frontend Domain (Vercel)

1. Purchase domain from registrar
2. Add to Vercel project
3. Configure DNS records
4. SSL automatically provisioned

### Backend Domain (Render)

1. Go to Settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Configure CNAME record
4. SSL automatically provisioned

### CORS Configuration

Update backend CORS for production:

```javascript
// config/cors.js
const corsOptions = {
  origin: [
    'https://your-frontend.vercel.app',
    'https://yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## Monitoring

### Application Monitoring

**Render Dashboard:**
- CPU and memory usage
- Request count and latency
- Error rates

**MongoDB Atlas Monitoring:**
- Connection count
- Operation latency
- Database size

### Log Aggregation

**Option 1: Render Logs**
- Built-in log viewer
- Log search and filtering

**Option 2: External Service**
- Papertrail
- LogDNA
- Datadog

### Uptime Monitoring

**Free Options:**
- [UptimeRobot](https://uptimerobot.com)
- [Freshping](https://freshping.io)

Configure monitoring for:
- Frontend: `https://your-domain.vercel.app`
- Backend: `https://your-api.onrender.com/api/health`

### Error Tracking

**Recommended: Sentry**

```bash
npm install @sentry/node
```

```javascript
// server.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Backend Dependencies
        run: cd backend && npm ci
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
      
      - name: Run Tests
        run: npm test
      
      - name: Build Frontend
        run: cd frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Render Deploy Hook

1. Go to Render Dashboard → Settings
2. Copy Deploy Hook URL
3. Add as GitHub Secret: `RENDER_DEPLOY_HOOK`

---

## Rollback Procedures

### Vercel Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Render Rollback

1. Go to Events
2. Find previous deployment
3. Click "Rollback"

### Database Rollback

1. Go to MongoDB Atlas → Backup
2. Select restore point
3. Restore to new cluster or in-place

### Emergency Procedures

**Backend Down:**
1. Check Render status page
2. Review logs for errors
3. Rollback if needed
4. Scale up if overloaded

**Database Issues:**
1. Check Atlas status
2. Review slow queries
3. Check connection limits
4. Restore from backup if needed

---

## Performance Optimization

### Frontend

- Enable gzip compression (automatic on Vercel)
- Configure caching headers
- Optimize images

### Backend

- Enable response compression
- Configure connection pooling
- Implement caching with Redis (optional)

```javascript
// server.js
import compression from 'compression';
app.use(compression());
```

### Database

- Ensure proper indexes
- Use projections in queries
- Enable database profiling

---

## Cost Estimation

### Free Tier

| Service | Free Tier Limits |
|---------|------------------|
| Vercel | 100GB bandwidth/month |
| Render | 750 hours/month, sleeps after 15min inactivity |
| MongoDB Atlas | M0 cluster, 512MB storage |

### Production (Small Team)

| Service | Plan | Estimated Cost |
|---------|------|----------------|
| Vercel | Pro | $20/month |
| Render | Starter | $7/month |
| MongoDB Atlas | M10 | $57/month |
| **Total** | | ~$84/month |

---

## Next Steps

After deployment:

1. ✅ Verify all features work in production
2. ✅ Set up monitoring and alerts
3. ✅ Configure backup schedule
4. ✅ Document production URLs
5. ✅ Share credentials securely with team

---

*Last Updated: December 2025*
