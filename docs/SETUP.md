# 🧩 TaskIt Project – Developer Setup Guide

Welcome to the **TaskIt** project!
This document explains how each team member should set up their local environment to start contributing smoothly.

---

## 1. 📦 Prerequisites

Make sure you have the following installed on your system:

* **Node.js** (version 18 or higher)
* **npm** (comes with Node)
* **Git**
* **VS Code** (recommended editor)
* **MongoDB Compass** (for backend team)

---

## 2. 🧰 Clone the Repository

1. Open your terminal and run:

   ```bash
   git clone git@github.com:akr-sed/Taskit.git
   or
   git clone https://github.com/akr-sed/Taskit.git
   cd Taskit
   ```

2. You should now see this structure:

   ```
   project-root/
   ├── backend/
   ├── frontend/
   └── .gitignore
   ```

---

## 3. ⚙️ Install Dependencies

Before doing anything else, install all required packages.

In both folders (`frontend` and `backend`), run:

```bash
cd backend
npm install
cd ../frontend
npm install
```

This installs all dependencies listed in `package.json`.

---

## 4. 🔐 Environment Variables Setup (FOR BACKEND TEAM)

Each member must create their own `.env` file **inside the `backend/` folder**.

You will find a file named `.env.example` in the same directory.
Use it as a template.

1. Copy the file:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Open the new `.env` file and fill in the values you receive from the project manager (Connection string to the database...etc).

   Example:

   ```
   PORT=5000
   MONGO_URI=mongodb+srv://backend-lead:<password>@cluster0.xxxxx.mongodb.net/taskit_dev?retryWrites=true&w=majority
   ```

   * **Do not share your .env file or push it to GitHub.**
   * The `.gitignore` file ensures it won’t be tracked.

---

## 5. 🌐 Connecting to MongoDB Atlas

The project uses a shared **MongoDB Atlas** database for development.

* You will receive a **unique connection string** from Akram (the project manager).
* Paste that connection string into your `.env` file under the key `MONGO_URI`.
* Example:

  ```
  MONGO_URI=mongodb+srv://backend-lead:yourPassword@cluster0.xxxxx.mongodb.net/taskit_dev?retryWrites=true&w=majority
  ```

This ensures everyone is working on the same database without conflicts.

---

## 6. 🚀 Running the Application

To start the backend server:

```bash
cd backend
npm run dev
```

To start the frontend:

```bash
cd frontend
npm run dev
```

When everything is set up correctly, you should see:

```
✅ Connected to MongoDB Atlas
✅ Server running on port 5000
```

and the frontend app running in your browser (usually on `http://localhost:3000`).

---

## 7. 🧑‍💻 Git & Collaboration Rules

* Always **pull the latest code** before starting work:

  ```bash
  git pull origin main
  ```
* **Never push your `.env` file or `node_modules`**.
* Create a **new branch** for your feature or fix:

  ```bash
  git checkout -b feature/login-page
  ```
* Once done, push your branch and open a pull request.

---

## 8. 🧾 Common Issues

| Issue                     | Solution                                                 |
| ------------------------- | -------------------------------------------------------- |
| `Authentication failed`   | Check your MongoDB username/password in `.env`.          |
| `ECONNREFUSED` or timeout | Ensure your IP is whitelisted in Atlas.                  |
| `Cannot find module`      | Run `npm install` again.                                 |
| `.env not found`          | Make sure you created it using `.env.example` as a base. |

---

## 9. 🧠 Best Practices

* Use **Prettier** for consistent code formatting.
* Use **clear commit messages** (e.g., `feat: add login form`).
* Communicate with the team before making schema or config changes.
* Test your routes carefully — avoid deleting all data or dropping collections.

---

## 10. ✅ Summary

Before running the project, make sure you have:

1. Cloned the repo
2. Installed dependencies (`npm install`)
3. Created your `.env` file using `.env.example`
4. Added the correct MongoDB connection string
5. Successfully run the backend and frontend locally

---
