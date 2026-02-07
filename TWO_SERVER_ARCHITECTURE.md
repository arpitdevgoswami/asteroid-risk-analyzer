# 🎯 Server Separation - Quick Reference

## Two Server Architecture Explained

Your application now has **2 separate servers** that work together:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                               │
│              http://localhost:8000                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Requests go to TWO different servers:
             │
    ┌────────┴─────────────────────────┐
    │                                  │
    ▼                                  ▼
┌──────────────────┐          ┌──────────────────┐
│  server.js       │          │  server1.js      │
│  Port 4000       │          │  Port 8000       │
│                  │          │                  │
│ AUTHENTICATION   │          │ NASA DATA &      │
│ & DATABASE       │          │ FRONTEND         │
│                  │          │                  │
│ ✅ Signup        │          │ ✅ Dashboard     │
│ ✅ Login         │          │ ✅ Asteroids     │
│ ✅ JWT Tokens    │          │ ✅ HTML/CSS/JS   │
│ ✅ User Data     │          │ ✅ NASA API      │
│ ✅ Watchlist     │          │                  │
│                  │          │                  │
│ DB: users.json   │          │ External: NASA   │
└──────────────────┘          └──────────────────┘
```

---

## 📊 What Each Server Does

### server.js (Port 4000) - AUTH & DATABASE
```
ENDPOINTS HANDLED:
├── POST /api/auth/signup           → Create user account
├── POST /api/auth/login            → Login user
├── GET /api/user/me                → Get user profile (protected)
├── PUT /api/user/profile           → Update profile (protected)
├── POST /api/user/watched-asteroid → Add to watchlist (protected)
├── GET /api/user/watched-asteroids → Get watchlist (protected)
├── DELETE /api/user/watched-asteroid/:id → Remove from list (protected)
└── GET /api/health                 → Server status

DATABASE:
└── users.json (all user accounts, passwords, watchlist)

SECURITY:
└── JWT Token validation on protected routes
```

### server1.js (Port 8000) - NASA DATA & FRONTEND
```
ENDPOINTS HANDLED:
├── GET /                           → Serve dashboard.html
├── GET /api/asteroids              → Get NASA NEO data
└── GET /api/health                 → Server status

FRONTEND:
├── dashboard.html         (main interface)
├── index.html            (login page)
├── register.html         (signup page)
├── style.css             (dashboard styling)
└── styles.css            (auth page styling)

DATA SOURCE:
└── NASA NEO API (https://api.nasa.gov/neo/)

FEATURES:
├── Real-time asteroid tracking
├── Login form with token handling
├── Signup form with validation
├── User profile display
└── Watched asteroids list
```

---

## 🔄 How They Communicate

### User Registration Flow
```
1. User clicks "Create Account" on dashboard (port 8000)
   ↓
2. Form sends POST to http://localhost:4000/api/auth/signup
   ↓
3. server.js validates and stores in users.json
   ↓
4. server.js returns JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. User redirected to dashboard (port 8000)
```

### User Login Flow
```
1. User enters credentials on login page (port 8000)
   ↓
2. Form sends POST to http://localhost:4000/api/auth/login
   ↓
3. server.js verifies password in users.json
   ↓
4. server.js returns JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. User redirected to dashboard (port 8000)
```

### Viewing Asteroids Flow
```
1. Dashboard loads (port 8000)
   ↓
2. JavaScript sends GET to http://localhost:8000/api/asteroids
   ↓
3. server1.js calls NASA NEO API
   ↓
4. server1.js formats and returns asteroid data
   ↓
5. Dashboard displays asteroids
```

---

## 🚀 Starting Both Servers

### Terminal 1 - Start Authentication Server
```bash
cd "path\to\asteroid-risk-analyzer"
npm start
# Starts server.js on port 4000
# Output: "🚀 Authentication Server running on http://localhost:4000"
```

### Terminal 2 - Start NASA Data Server
```bash
cd "path\to\asteroid-risk-analyzer"
node server1.js
# Starts server1.js on port 8000
# Output: "🚀 NASA Data Server running on http://localhost:8000"
```

### Result
```
✅ Port 4000 - Authentication API (server.js)
✅ Port 8000 - Dashboard & Data (server1.js)
✅ Open http://localhost:8000 in browser
```

---

## 📝 Common API Calls

### From Frontend to server.js (Port 4000)

**Signup:**
```javascript
fetch('http://localhost:4000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john',
    email: 'john@example.com',
    password: 'Pass123',
    confirmPassword: 'Pass123'
  })
})
```

**Login:**
```javascript
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john',
    password: 'Pass123'
  })
})
```

**Get User Data (Protected):**
```javascript
fetch('http://localhost:4000/api/user/me', {
  headers: { 
    'Authorization': 'Bearer ' + localStorage.authToken
  }
})
```

### From Frontend to server1.js (Port 8000)

**Get Asteroids:**
```javascript
fetch('http://localhost:8000/api/asteroids')
```

---

## 🔑 Important Files

| File | Server | Purpose |
|------|--------|---------|
| server.js | Port 4000 | Authentication server |
| server1.js | Port 8000 | NASA data & frontend server |
| users.json | Port 4000 | User database |
| dashboard.html | Port 8000 | Main UI |
| index.html | Port 8000 | Login page |
| register.html | Port 8000 | Signup page |

---

## ✅ Verification Commands

### Check if servers are running:
```powershell
# Test Auth Server
Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET

# Test Data Server
Invoke-WebRequest -Uri "http://localhost:8000/api/health" -Method GET

# Get Asteroids
Invoke-WebRequest -Uri "http://localhost:8000/api/asteroids" -Method GET
```

---

## 🎯 Why Two Servers?

| Benefit | Explanation |
|---------|-------------|
| **Separation of Concerns** | Auth separate from data |
| **Scalability** | Can scale each independently |
| **Security** | Small auth server, less attack surface |
| **Maintenance** | Easier to update one without affecting other |
| **Performance** | Data server handles heavy NASA API calls |
| **Multiple Instances** | Can run multiple data servers, one auth |

---

## 📦 On Another System

To deploy to another computer:

1. **Copy folder** to new system
2. **Run `npm install`**
3. **Open 2 terminals:**
   - Terminal 1: `npm start`
   - Terminal 2: `node server1.js`
4. **Open http://localhost:8000**

✅ Everything works automatically!

---

**System Status:** ✅ Two Server Architecture Active  
**Last Update:** February 8, 2026
