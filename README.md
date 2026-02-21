# Smart e-Waste Collection & Management System

Full-stack authentication system with React, Spring Boot, and MongoDB.

## Prerequisites

- Java 17+
- Maven 3.6+ (or use included Maven in `maven/` directory)
- MongoDB 4.4+
- Node.js 16+ and npm
- Gmail account (for sending verification emails)

## Configuration

### Email Setup (Required)

Before running the backend, configure email settings in `smart-ewaste-backend/src/main/resources/application.properties`:

1. **For Gmail:** Enable "App Passwords" in your Google Account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Generate App Password for "Mail"

2. **Update configuration:**
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-digit-app-password
```

## Steps to Run

### 1. Start MongoDB

**Option A - Windows Service (requires admin):**
```powershell
net start MongoDB
```

**Option B - Manual Start:**
```powershell
Start-Process mongod -ArgumentList "--dbpath C:\data\db" -WindowStyle Hidden
```

Verify MongoDB is running:
```powershell
mongosh --eval "db.version()"
```

### 2. Start Backend (Spring Boot)

**If Maven is in PATH:**
```powershell
cd smart-ewaste-backend
mvn spring-boot:run
```

**If Maven is NOT in PATH (use included Maven):**
```powershell
$env:PATH = "G:\infosys harhsini ns\Project\maven\apache-maven-3.9.5\bin;" + $env:PATH
cd smart-ewaste-backend
mvn spring-boot:run
```

Backend will start on: **http://localhost:8080**

### 3. Start Frontend (React)

Open a new terminal:
```powershell
cd smart-ewaste-frontend
npm install    # First time only
npm run dev
```

Frontend will start on: **http://localhost:3000**

## Access the Application

Open your browser and go to: **http://localhost:3000**

## Features

- **Register** - Create new user account (verification email sent)
- **Email Verification** - Click link in email to set password
- **Login** - JWT token-based authentication (only after email verification)
- **Profile** - View and edit user information
- **Logout** - Clear session

## User Registration Flow

1. User fills registration form (name, email, phone, address)
2. System sends verification email with password setup link
3. User clicks link in email
4. User sets password on verification page
5. Account is activated
6. User can now login with email and password

## API Endpoints

- `POST /api/auth/register` - User registration (sends verification email)
- `POST /api/auth/set-password` - Set password via email token
- `POST /api/auth/login` - User login (requires verified email)
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/update` - Update user profile (protected)

## Technology Stack

- **Backend:** Spring Boot 3.1.5, Spring Security, JWT, MongoDB
- **Frontend:** React 18, Vite, React Router, Axios
- **Database:** MongoDB

## Default Configuration

- Backend Port: 8080
- Frontend Port: 3000
- MongoDB Port: 27017
- JWT Secret: (configured in application.properties)
- Token Expiry: 24 hours
