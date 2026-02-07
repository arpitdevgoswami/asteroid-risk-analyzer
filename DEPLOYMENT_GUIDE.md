# 📦 Deployment Guide - Two Server Architecture

## ✅ What's Been Done

Your project has been successfully split into **2 separate servers**:

### **Server Separation Complete:**

```
✅ server.js       (Port 4000) = Authentication & Database API
✅ server1.js      (Port 8000) = NASA Data & Dashboard Server
✅ users.json      = User database (auto-created)
✅ CORS enabled    = Cross-server communication working
✅ JWT Auth        = Secure token-based authentication
```

---

## 🚀 Deploy to Another System

### **Step 1: Copy Project Folder**

Copy the entire `asteroid-risk-analyzer` folder to the new system:
```
c:\Users\[YourName]\OneDrive\Documents\GitHub\asteroid-risk-analyzer\
```

### **Step 2: Install Dependencies**

Open PowerShell in the project folder and run:
```powershell
npm install
```

This installs all required packages from `package.json`:
- express
- cors
- multer
- jsonwebtoken
- axios

### **Step 3: Start Both Servers**

You need **two terminal windows** open simultaneously:

**Terminal 1 - Authentication Server:**
```powershell
cd c:\Users\[YourName]\OneDrive\Documents\GitHub\asteroid-risk-analyzer
npm start
```
This starts `server.js` on **Port 4000**

**Terminal 2 - NASA Data Server:**
```powershell
cd c:\Users\[YourName]\OneDrive\Documents\GitHub\asteroid-risk-analyzer
node server1.js
```
This starts `server1.js` on **Port 8000**

### **Step 4: Open in Browser**

Go to: **http://localhost:8000**

---

## 🔌 Server Configuration

### **server.js - Authentication Server**

**Port:** 4000  
**Purpose:** User authentication, account management, database

**Key Endpoints:**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login user
- `GET /api/user/me` - Get user profile (requires JWT)
- `PUT /api/user/profile` - Update profile (requires JWT)
- `POST/DELETE /api/user/watched-asteroid` - Manage watchlist

**Database:**
- File: `users.json`
- Format: JSON objects with UUID keys
- Auto-created on first run

### **server1.js - NASA Data Server**

**Port:** 8000  
**Purpose:** Real-time asteroid data and dashboard UI

**Key Endpoints:**
- `GET /api/asteroids` - Get today's near-Earth objects from NASA
- `GET /` - Serve dashboard.html
- `GET /api/health` - Server status

**Data Source:**
- NASA NEO (Near-Earth Object) API
- Real-time asteroid tracking
- Updated daily

---

## 📋 Dual Server Architecture

```
Browser (http://localhost:8000)
        │
        ├─→ Static Files (HTML/CSS/JS)
        │   Served by: server1.js (Port 8000)
        │
        ├─→ Asteroid Data
        │   Endpoint: http://localhost:8000/api/asteroids
        │   Source: NASA API via server1.js
        │
        └─→ Authentication Requests
            Endpoint: http://localhost:4000/api/auth/*
            Handled by: server.js (Port 4000)
            Database: users.json
```

---

## ✅ Verification Checklist

### On New System:

- [ ] Project folder copied successfully
- [ ] `npm install` completed without errors
- [ ] Both servers start without port conflicts
- [ ] Can access http://localhost:8000 in browser
- [ ] Signup form works and creates account
- [ ] Login form accepts credentials
- [ ] Dashboard loads and shows asteroids
- [ ] User data persists after refresh
- [ ] Logout clears session

---

## 🔒 Data Persistence

### **Users are stored in `users.json`**

File location: `asteroid-risk-analyzer/users.json`

**Format:**
```json
{
  "uuid-1": {
    "id": "uuid-1",
    "username": "john_doe",
    "email": "john@example.com",
    "password": "hashed-password",
    "createdAt": "2026-02-08T...",
    "avatarUrl": "/uploads/default-avatar.png",
    "watchedAsteroids": [...],
    "alerts": []
  }
}
```

**Important:**
- File is auto-created if missing
- Data persists between server restarts
- Can be backed up or transferred between systems

---

## 🐛 Troubleshooting on New System

### Problem: "Port already in use"

**Solution:** Change port in server1.js line 6:
```javascript
const PORT = process.env.PORT || 8001;  // Change to 8001, 9000, etc.
```

Or use environment variable:
```powershell
$env:PORT=8001; node server1.js
```

### Problem: "Cannot find module 'express'"

**Solution:** Run `npm install` again:
```powershell
npm install
```

### Problem: "Cannot access registered users"

**Solution:** Check users.json exists:
```powershell
ls users.json  # Should show file
dir users.json # Alternative command
```

If missing, create empty one:
```powershell
'{}' | Out-File -FilePath users.json -Encoding UTF8
```

### Problem: "NASA API not working"

**Solution:** Check internet connection and API key in server1.js (line 6)

---

## 📁 File Structure on New System

After copying and running `npm install`:

```
asteroid-risk-analyzer/
├── server.js                    ← Run: npm start
├── server1.js                   ← Run: node server1.js
│
├── public/                      ← Frontend files
│   ├── dashboard.html           ← Main UI
│   ├── index.html               ← Login page
│   ├── register.html            ← Signup page
│   ├── style.css
│   └── styles.css
│
├── users.json                   ← User database (created automatically)
├── uploads/                     ← Avatar storage (created automatically)
│
├── package.json                 ← Dependencies list
├── node_modules/                ← Libraries (created by npm install)
│
└── Documentation
    ├── DUAL_SERVER_SETUP.md
    ├── AUTHENTICATION_SETUP.md
    ├── QUICK_START.md
    └── This file (DEPLOYMENT_GUIDE.md)
```

---

## 🔄 Data Transfer Between Systems

### To transfer user accounts to another system:

**Step 1:** Copy `users.json` from old system
```powershell
copy "path\to\old\users.json" "path\to\new\users.json"
```

**Step 2:** Start both servers on new system
```powershell
# All previous users will be accessible
```

---

## 💡 Key Points for New System Deployment

1. **No additional configuration needed** - Everything works out of the box
2. **Database is local** - Each system has its own `users.json`
3. **Two separate services** - Must run both servers simultaneously
4. **Port independence** - Can change ports in config
5. **CORS enabled** - Cross-origin requests work between servers
6. **No external dependencies** - Only npm packages (all local)

---

## 📞 Quick Reference

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start auth server | `npm start` |
| Start data server | `node server1.js` |
| Open dashboard | http://localhost:8000 |
| Test auth API | http://localhost:4000/api/health |
| Test data API | http://localhost:8000/api/health |
| Get asteroids | http://localhost:8000/api/asteroids |

---

## ✨ System Features

✅ **User Authentication**
- Signup with email validation
- Login with JWT tokens
- Password hashing

✅ **Real-time Data**
- NASA NEO API integration
- Asteroid tracking
- Hazard classification

✅ **Data Persistence**
- User accounts saved locally
- Watched asteroids list
- User preferences

✅ **Security**
- JWT authentication
- CORS protection
- XSS prevention (localStorage)

---

**Status:** ✅ Ready for Deployment  
**Last Updated:** February 8, 2026  
**Version:** 2.0 (Dual Server Architecture)
