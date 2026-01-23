# 🚀 Taskly: Advanced MERN Task Management System

Taskly is a full-stack, scalable web application designed for high-efficiency productivity tracking. This project demonstrates a robust implementation of the MERN stack with a focus on security, responsive UI/UX, and professional folder architecture.

## 🌐 Live Links
- **Deployed Frontend:** [https://task-management-primetrade.vercel.app/](https://task-management-primetrade.vercel.app/)
- **API Endpoint:** [https://task-management-primetrade.onrender.com/api](https://task-management-primetrade.onrender.com/api)

---

## ✨ Features implemented
- **Full Authentication Flow:** Secure user registration and login using JWT-based authentication.
- **Responsive Dashboard:** A clean, modern UI built with TailwindCSS that adapts to any screen size.
- **Task Management (CRUD):** Users can create, view, update, and delete tasks with immediate UI updates
- **Real-time Search & Filter:** Instantly find tasks by title or filter by status (Pending, In Progress, Completed).
- **Progress Tracking:** A visual dashboard showing the percentage of tasks completed.
- **Calendar & List Views:** Toggle between a standard list view and a date-based calendar view for better planning.

---

## 🛠️ Tech Stack
- **Frontend:** React.js (Vite), TailwindCSS, Lucide-React, Date-fns.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas[cite: 20].
- **Security:** Bcrypt.js (Password Hashing) and JSON Web Tokens (JWT).

---

## 🏗️ Scalability & Production Note (Requirement #5)
To scale this integration for a production environment with millions of users, I would implement the following strategies:

1.**Database Optimization:** Implement MongoDB Sharding to distribute data across multiple servers and use indexing on `user_id` and `status` for faster queries.
2. **State Management:** Migrate from local state to **Redux Toolkit** or **React Query** to handle complex global states and server-side caching.
3. **Caching Layer:** Integrate **Redis** to cache frequently accessed data like user profiles and active tasks to reduce DB load[cite: 44].
4. **Load Balancing:** Deploy the backend using a Load Balancer (like Nginx or AWS ELB) to distribute traffic across multiple Node.js instances.
5.**Enhanced Security:** Move from local storage to **HTTP-only Cookies** for JWT storage to mitigate XSS risks.

## 📂 Project Architecture & Folder Structure
This project follows a **Modular Pattern** to ensure high scalability and ease of maintenance.

### Backend (Node/Express)
```text
backend/
├── config/             # Database connection (MongoDB Atlas)
├── controllers/        # Logical handlers for each route (Auth, Task)
├── middleware/         # Security & JWT Verification logic
├── models/             # Mongoose Schemas (User, Task)
├── routes/             # API Endpoints definition
├── .env                # Environment variables (Hidden for security)
└── server.js           # Entry point for the API

### Frontend (React/Vite)
```text
frontend/
├── src/
│   ├── api/            # Axios instance with JWT interceptors
│   ├── components/     # Reusable UI components (CalendarView, etc.)
│   ├── context/        # Global AuthState using React Context API
│   ├── pages/          # Main application screens (Login, Dashboard)
│   ├── App.jsx         # Routing & Protected Route logic
│   └── main.jsx        # App entry point
├── vercel.json         # SPA routing configuration for Vercel
└── tailwind.config.js  # Styling configuration


## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js installed
- MongoDB Atlas account

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file with your MONGO_URI, JWT_SECRET, and PORT=5000
npm start

### 2. Setup Frontend
```bash
cd frontend
npm install
# Ensure baseURL in axios.js points to http://localhost:5000/api
npm run dev

📝 API Documentation
POST /api/auth/register - Create a new account.

POST /api/auth/login - Authenticate and receive a JWT.

GET /api/tasks - Retrieve all tasks for the logged-in user (Protected).

POST /api/tasks - Create a new task (Protected).

PUT /api/tasks/:id - Update task status or title (Protected).

DELETE /api/tasks/:id - Delete a specific task (Protected).

