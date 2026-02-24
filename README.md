# TaskFlow Manager

A full-stack task management system built with **React (TypeScript)**
and **Laravel**, designed with a clean RESTful architecture and secure
token-based authentication.

TaskFlow Manager enables users to manage tasks efficiently through
filtering, sorting, pagination, and protected routes.

------------------------------------------------------------------------

## 🚀 Overview

TaskFlow Manager is structured as a decoupled frontend-backend system:

- **Frontend**: React + TypeScript SPA
- **Backend**: Laravel REST API
- **Database**: MySQL (via XAMPP)
- **Authentication**: Token-based authentication
- **API Communication**: Axios

The system follows industry-standard project structure, authentication
flow, and separation of concerns.

------------------------------------------------------------------------

## ✨ Features

- User Registration & Login
- Token-based Authentication
- Protected Routes (Frontend & Backend)
- Task CRUD Operations
- Filtering (status, priority)
- Sorting
- Pagination
- Modular Backend Architecture (Models, Controllers, Routes)
- CORS Configuration for cross-origin requests

------------------------------------------------------------------------

## 🖼 Screenshots

> Replace these placeholders with actual screenshots stored in
> `/screenshots`

-`/screenshots/login.png`
-`/screenshots/register.png`
-`/screenshots/dashboard.png`
-`/screenshots/task-list.png`

Example usage after adding images:

```
![Login Page](./screenshots/login.png)
```

------------------------------------------------------------------------

## 🏗 Architecture

### High-Level System Flow

```
React (Frontend)
        ↓
Axios API Requests
        ↓
Laravel REST API
        ↓
MySQL Database (XAMPP)
```

### Backend Structure

- Models\
- Controllers\
- API Routes\
- Middleware (Authentication)\
- Database Migrations

### Frontend Structure

- Pages (Login, Register, Dashboard, Tasks)
- Reusable Components
- Context API for Authentication
- Protected Route Logic
- API Service Layer (Axios)

------------------------------------------------------------------------

## 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Axios
- Context API
- Tailwind CSS

### Backend

- Laravel
- PHP
- RESTful API Design
- Middleware-based Authentication

### Database

- MySQL (XAMPP)

### Development Tools

- Git
- GitHub
- VS Code

------------------------------------------------------------------------

## 📂 Project Structure

```
taskflow-manager/
│
├── backend/          # Laravel API
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── ...
│
├── frontend/         # React Application
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── screenshots/
└── README.md
```

------------------------------------------------------------------------

## ⚙️ Installation Guide

### 1️⃣ Clone the Repository

```bash
git clone <https://github.com/yourusername/taskflow-manager.git>
cd taskflow-manager
```

------------------------------------------------------------------------

### 2️⃣ Backend Setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Ensure your local MySQL server (XAMPP) is running before migrating.

------------------------------------------------------------------------

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will connect to the Laravel backend API.

------------------------------------------------------------------------

## 🔐 Authentication Flow

1. User logs in via frontend form.
2. Backend validates credentials.
3. Backend generates authentication token.
4. Token is stored on the client.
5. Token is attached to future API requests via Authorization header.
6. Middleware validates token before granting access to protected
    routes.

This ensures secure access control between frontend and backend.

------------------------------------------------------------------------

## 📡 API Endpoints

### Authentication

- POST /api/register
- POST /api/login
- POST /api/logout

### Tasks

- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}

All task routes require authentication.

------------------------------------------------------------------------

## 🧪 Testing Status

Currently focused on:

- Functional testing of API endpoints
- Frontend-backend integration validation

Planned:

- Unit testing (Laravel)
- Integration testing
- End-to-end testing

------------------------------------------------------------------------

## 🚀 Future Improvements

- Role-Based Access Control (RBAC)
- Real-time updates
- Docker containerization
- Deployment to cloud hosting
- Advanced analytics dashboard
- Automated task duration prediction (AI integration)

------------------------------------------------------------------------

## 📌 Learning Objectives

This project demonstrates:

- Full-stack development
- REST API design principles
- Authentication implementation
- Proper state management
- Clean project architecture
- Separation of frontend and backend concerns
- Secure environment configuration practices

------------------------------------------------------------------------

## 📜 License

This project is for educational and portfolio purposes.
