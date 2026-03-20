# ♻️ Smart e-Waste Collection & Management System

A **full-stack web application** developed during **Infosys Virtual Internship 6.0**, designed to manage and streamline e-waste collection with secure user authentication.

---

## 🚀 Project Overview

The **Smart e-Waste System** helps users register, verify their email, and manage their profile securely. It ensures safe authentication using **JWT tokens** and supports a smooth user onboarding process.

---

## 🛠️ Tech Stack

### 🔹 Backend

* Spring Boot 3.1.5
* Spring Security
* JWT Authentication
* MongoDB

### 🔹 Frontend

* React 18
* Vite
* React Router
* Axios

### 🔹 Database

* MongoDB

---

## ⚙️ Prerequisites

Make sure you have installed:

* Java 17+
* Maven 3.6+
* MongoDB 4.4+
* Node.js 16+ and npm
* Gmail account (for email verification)

---

## 📧 Email Configuration (Important)

To enable email verification:

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Generate **App Password**

Update in:

```
smart-ewaste-backend/src/main/resources/application.properties
```

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-digit-app-password
```

---

## ▶️ Steps to Run the Project

### 1️⃣ Start MongoDB

```powershell
net start MongoDB
```

OR

```powershell
Start-Process mongod -ArgumentList "--dbpath C:\data\db"
```

Verify:

```powershell
mongosh --eval "db.version()"
```

---

### 2️⃣ Run Backend (Spring Boot)

```powershell
cd smart-ewaste-backend
mvn spring-boot:run
```

Backend runs on:
👉 http://localhost:8080

---

### 3️⃣ Run Frontend (React)

```powershell
cd smart-ewaste-frontend
npm install
npm run dev
```

Frontend runs on:
👉 http://localhost:3000

---

## 🌐 Access Application

Open in browser:
👉 http://localhost:3000

---

## 🔐 Features

* ✅ User Registration
* 📧 Email Verification System
* 🔑 Secure Login (JWT-based)
* 👤 User Profile Management
* 🔓 Logout Functionality

---

## 🔄 User Flow

1. User registers (name, email, phone, address)
2. System sends verification email
3. User clicks verification link
4. User sets password
5. Account gets activated
6. User logs in securely

---

## 📡 API Endpoints

| Method | Endpoint               | Description    |
| ------ | ---------------------- | -------------- |
| POST   | /api/auth/register     | Register user  |
| POST   | /api/auth/set-password | Set password   |
| POST   | /api/auth/login        | Login user     |
| GET    | /api/user/profile      | Get profile    |
| PUT    | /api/user/update       | Update profile |

---

## ⚙️ Default Configuration

* Backend: 8080
* Frontend: 3000
* MongoDB: 27017
* Token Expiry: 24 Hours

---

## 📌 Key Highlights

* 🔒 Secure authentication with JWT
* 📧 Email verification system
* ⚡ Fast frontend using Vite
* 🧩 Clean architecture (frontend + backend separation)

---

## 🎓 Internship

Developed as part of:
**Infosys Virtual Internship 6.0**

---

## 👨‍💻 Author

**Paravin Mulla**

---

## ⭐ Future Improvements

* Admin dashboard
* E-waste pickup scheduling
* Location tracking
* Analytics dashboard

---

## 📜 License

This project is for learning and educational purposes.

---
