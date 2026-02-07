# 🚀 Dual Server Architecture - Asteroid Risk Analyzer

## System Overview

Your project now uses **2 separate servers** for optimal performance and security:

### Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           Asteroid Risk Analyzer System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────────┐ │
│  │  server.js           │      │  server1.js              │ │
│  │  Port: 4000          │      │  Port: 5000              │ │
│  │                      │      │                          │ │
│  │  Authentication API  │      │  NASA Data API           │ │
│  │  ✅ User Signup      │      │  ✅ Real-time Asteroids │ │
│  │  ✅ User Login       │      │  ✅ Dashboard View       │ │
│  │  ✅ JWT Tokens       │      │  ✅ Streaming Data       │ │
│  │  ✅ User Management  │      │  ✅ Health Check         │ │
│  │  ✅ Data Persistence │      │                          │ │
│  │                      │      │                          │ │
│  │  Database: users.json │      │  External: NASA API      │ │
│  └──────────────────────┘      └──────────────────────────┘ │
│           │                               │                  │
│           └───────────────┬───────────────┘                  │
│                           │                                  │
│                    Frontend Communication                    │
│                  (Dashboard + Forms)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Server Responsibilities

### **server.js - Authentication Server (Port 4000)**

**Purpose:** User authentication and account management only

**Endpoints:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/user/me` - Get current user (protected)
- `PUT /api/user/profile` - Update profile (protected)
- `POST /api/user/watched-asteroid` - Add to watchlist (protected)
- `GET /api/user/watched-asteroids` - Get watchlist (protected)
- `DELETE /api/user/watched-asteroid/:id` - Remove watchlist (protected)
- `GET /api/health` - Server status

**Database:** `users.json`

**Security:** JWT authentication required for protected routes

---

### **server1.js - NASA Data Server (Port 5000)**

**Purpose:** Real-time asteroid data and dashboard interface

**Endpoints:**
- `GET /api/asteroids` - Get today's near-Earth objects from NASA
- `GET /` - Serve dashboard.html
- `GET /api/health` - Server status

**Data Source:** NASA NEO API

**Features:**
- Real-time asteroid tracking
- Hazard classification
- Distance & velocity calculations
- Dashboard UI

---

## 📋 How to Run Both Servers

### **Option 1: Open Two Terminal Windows**

**Terminal 1 - Start Auth Server:**
```bash
cd c:/Users/biswa/OneDrive/Documents/GitHub/asteroid-risk-analyzer
npm start                    # Runs server.js on port 4000
```

**Terminal 2 - Start NASA Data Server:**
```bash
cd c:/Users/biswa/OneDrive/Documents/GitHub/asteroid-risk-analyzer
node server1.js              # Runs server1.js on port 5000
```

### **Option 2: Create a Batch File (Automatic)**

Create `start-servers.bat` in your project folder:

```batch
@echo off
echo Starting Dual Servers...
echo.
echo Terminal 1: Auth Server (Port 4000)
start cmd /k "cd c:\Users\biswa\OneDrive\Documents\GitHub\asteroid-risk-analyzer && npm start"
timeout /t 2
echo Terminal 2: NASA Data Server (Port 5000)
start cmd /k "cd c:\Users\biswa\OneDrive\Documents\GitHub\asteroid-risk-analyzer && node server1.js"
echo.
echo Both servers started!
echo ✅ Auth Server: http://localhost:4000
echo ✅ NASA Data Server: http://localhost:5000
pause
```

Then run: `start-servers.bat`

---

## 🔍 Verify Both Servers Are Running

### Test Authentication Server (Port 4000)
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET
```
Expected: `{"status":"OK","server":"Authentication API"}`

### Test NASA Data Server (Port 5000)
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET
```
Expected: `{"status":"OK","server":"NASA Data API"}`

### Get Asteroid Data
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/asteroids" -Method GET
```
Expected: Array of today's asteroids from NASA

---

## 🌐 Access Points

| Feature | URL |
|---------|-----|
| **Login Page** | http://localhost:5000/ |
| **Register Page** | http://localhost:5000/register.html |
| **Dashboard** | http://localhost:5000/dashboard.html |
| **Auth Health** | http://localhost:4000/api/health |
| **Data Health** | http://localhost:5000/api/health |
| **Asteroids API** | http://localhost:5000/api/asteroids |

---

## 🔐 Authentication Flow

```
1. User goes to http://localhost:5000 (NASA Data Server)
2. User clicks "Create Account" or "Login"
3. Request sent to http://localhost:4000/api/auth/signup or /login (Auth Server)
4. Auth Server validates & stores in users.json, returns JWT token
5. Frontend stores token in localStorage
6. Token used to access protected endpoints on Auth Server
7. Dashboard displays asteroid data from NASA Server
```

---

## 📁 File Structure

```
asteroid-risk-analyzer/
├── server.js                    ← Authentication Server (Port 4000)
├── server1.js                   ← NASA Data Server (Port 5000)
│
├── public/
│   ├── dashboard.html           ← Main interface
│   ├── index.html               ← Login page
│   ├── register.html            ← Signup page
│   ├── style.css
│   └── styles.css
│
├── users.json                   ← User database (auto-created)
├── uploads/                     ← Avatar storage
│
├── package.json
├── node_modules/
│
└── DUAL_SERVER_SETUP.md         ← This file
```

---

## ⚡ Quick Start

### First Time Setup
```bash
npm install
```

### Start Both Servers
```bash
# Terminal 1
npm start

# Terminal 2
node server1.js
```

### Test Signup Flow
1. Open http://localhost:5000/register.html
2. Create account (username, email, password)
3. Click "Create Account"
4. Should redirect to dashboard
5. Sidebar shows your username

### Test Login Flow
1. Open http://localhost:5000/index.html
2. Enter credentials
3. Click "Login"
4. Should redirect to dashboard
5. Dashboard loads asteroid data from NASA

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process using port 4000
Get-Process -Name node | Stop-Process -Force

# Or use specific port
PORT=4001 npm start
PORT=5001 node server1.js
```

### CORS Errors
Both servers have CORS enabled. If issues persist:
- Ensure both servers are running
- Check browser console for specific errors
- Verify URLs in frontend code

### Cannot Connect to NASA API
- Check internet connection
- Verify NASA API key is valid
- Try visiting NASA NEO API directly in browser

### Users Not Saving
- Check `users.json` exists in project root
- Verify file permissions (should be writable)
- Check server.js console for errors

---

## 🚀 Environment Variables

### Optional Configuration

Create `.env` file in project root:

```
# Port Configuration
AUTH_SERVER_PORT=4000
DATA_SERVER_PORT=5000

# Database
USERS_FILE=./users.json

# JWT
JWT_SECRET=your-secret-key

# NASA API
NASA_API_KEY=py68ASYJWRChDIR3wha2XEozyu3aqykOZjVxbS77
```

Then use in code:
```javascript
const PORT = process.env.AUTH_SERVER_PORT || 4000;
```

---

## 📞 Server Status

### Current Configuration
- ✅ **server.js** → Port 4000 (Authentication)
- ✅ **server1.js** → Port 5000 (NASA Data)
- ✅ **Database** → users.json
- ✅ **CORS** → Enabled on both servers
- ✅ **API** → NASA NEO API integrated

---

## 🔄 Data Flow Examples

### Example 1: User Signup
```
Frontend → POST /api/auth/signup (Port 4000)
          ↓
       server.js validates
          ↓
       Saves to users.json
          ↓
       Returns JWT token
          ↓
       Frontend stores token
          ↓
       Redirects to dashboard (Port 5000)
```

### Example 2: Get Asteroid Data
```
Frontend → GET /api/asteroids (Port 5000)
          ↓
       server1.js calls NASA API
          ↓
       Parses asteroid data
          ↓
       Returns formatted JSON
          ↓
       Dashboard displays asteroids
```

---

## ✅ System Ready

Both servers are properly configured and ready to use across any system!

**Last Updated:** February 8, 2026  
**Status:** ✅ Dual Server Architecture Active
