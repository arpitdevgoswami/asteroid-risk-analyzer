# Cosmic Watch - User Authentication Database Setup

## System Overview

This authentication system provides:
- **User Registration** (Signup)
- **User Login** with JWT tokens
- **Session Management** with localStorage
- **User Profile Management**
- **Watched Asteroids** tracking
- **JSON-based Database** (users.json)

## Database Schema

### User Object (users.json)
```json
{
  "user-uuid": {
    "id": "unique-uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "password": "hashed-password",
    "createdAt": "2026-02-08T10:30:00.000Z",
    "avatarUrl": "/uploads/avatar-xxxx.png",
    "watchedAsteroids": [
      {
        "id": "2024XR7",
        "name": "Asteroid 2024XR7",
        "addedAt": "2026-02-08T10:30:00.000Z"
      }
    ],
    "alerts": []
  }
}
```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure123",
    "confirmPassword": "secure123"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "avatarUrl": "/uploads/default-avatar.png"
  }
}
```

#### POST `/api/auth/login`
Login with credentials
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure123"
  }'
```

### User Data

#### GET `/api/user/me`
Get current user data (requires authentication)
```bash
curl -X GET http://localhost:4000/api/user/me \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "avatarUrl": "/uploads/default-avatar.png",
  "watchedAsteroids": [],
  "alerts": [],
  "createdAt": "2026-02-08T10:30:00.000Z"
}
```

#### PUT `/api/user/profile`
Update user profile with optional avatar upload
```bash
curl -X PUT http://localhost:4000/api/user/profile \
  -H "Authorization: Bearer <token>" \
  -F "username=new_username" \
  -F "avatar=@/path/to/avatar.jpg"
```

#### POST `/api/user/watched-asteroid`
Add asteroid to watchlist
```bash
curl -X POST http://localhost:4000/api/user/watched-asteroid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "asteroidId": "2024XR7",
    "asteroidName": "Asteroid 2024XR7"
  }'
```

#### GET `/api/user/watched-asteroids`
Get watched asteroids
```bash
curl -X GET http://localhost:4000/api/user/watched-asteroids \
  -H "Authorization: Bearer <token>"
```

#### DELETE `/api/user/watched-asteroid/:asteroidId`
Remove asteroid from watchlist
```bash
curl -X DELETE http://localhost:4000/api/user/watched-asteroid/2024XR7 \
  -H "Authorization: Bearer <token>"
```

## Frontend Flow

### 1. Registration (register.html)
```
User fills signup form → Sends data to /api/auth/signup → Receives token → Stores in localStorage → Redirects to dashboard
```

### 2. Login (index.html)
```
User fills login form → Sends data to /api/auth/login → Receives token → Stores in localStorage → Redirects to dashboard
```

### 3. Dashboard (dashboard.html)
```
Page loads → Checks localStorage for token → Fetches /api/user/me → Displays user info in sidebar → User can manage profile/asteroids
```

### 4. Session Management
- **Token Storage**: localStorage.authToken
- **User Data Storage**: localStorage.user
- **Logout**: Clear localStorage → Redirect to login

## Starting the Server

```bash
npm install
npm start
```

The server will start on http://localhost:4000

## Files Modified/Created

- ✅ `server.js` - Active authentication backend
- ✅ `users.json` - Database file (created on first use)
- ✅ `public/index.html` - Login form with API integration
- ✅ `public/register.html` - Signup form with API integration
- ✅ `public/dashboard.html` - Dashboard with auth check and user data fetch

## Security Notes

- **Password Hashing**: Uses SHA256 (upgrade to bcrypt for production)
- **JWT Secret**: Stored in environment variable or defaults to dev key
- **Token Expiry**: 7 days
- **File Uploads**: Limited to 2MB, only JPG/PNG allowed
- **CORS**: Enabled for development

## Example User Creation

After server starts, a user can:

1. **Signup**: Go to http://localhost:4000/register.html
2. **Login**: Go to http://localhost:4000/
3. **View Dashboard**: After login, go to http://localhost:4000/dashboard.html

## Testing with cURL

### Create a test user
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456",
    "confirmPassword": "test123456"
  }'
```

Copy the token from response and test authenticated endpoints:

```bash
TOKEN="your-token-here"
curl -X GET http://localhost:4000/api/user/me \
  -H "Authorization: Bearer $TOKEN"
```

## Future Enhancements

- Add email verification
- Implement password reset
- Add OAuth (Google, Facebook)
- Upgrade to bcrypt for password hashing
- Add rate limiting
- Add 2FA authentication
- Use a real database (MongoDB, PostgreSQL)
