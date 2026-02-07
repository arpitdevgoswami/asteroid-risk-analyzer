# Edit Profile Feature - Setup & Usage Guide

## Overview
Complete Edit Profile feature for your asteroid-risk-analyzer app with full-stack React + Node.js implementation.

### Features
✅ User profile display with avatar, name, email  
✅ Edit profile modal with file upload  
✅ Image preview with instant feedback  
✅ File validation (JPG/PNG, max 2MB)  
✅ JWT authentication  
✅ Responsive design matching your dark cosmic theme  
✅ Success/error messages  

---

## Backend Setup

### 1. Install Dependencies
```bash
npm install
```

This installs: `express`, `multer`, `jsonwebtoken`, `cors`

### 2. Environment Variables (Optional)
Create a `.env` file in the root directory:
```
JWT_SECRET=your-secret-key-here
PORT=4000
```

If not set, defaults: `JWT_SECRET=dev-secret`, `PORT=4000`

### 3. Database File
- `users.json` stores user profiles (already created)
- Structure:
```json
{
  "1": {
    "id": "1",
    "name": "User Name",
    "email": "user@example.com",
    "avatarUrl": "/uploads/avatar-filename.jpg"
  }
}
```

### 4. Uploads Folder
- `/uploads` folder stores uploaded avatars (created automatically)
- Images accessible at: `/uploads/avatar-{userId}-{timestamp}.jpg`

---

## Backend Endpoints

### GET /api/user/me
**Requires:** JWT token in `Authorization: Bearer {token}` header  
**Returns:** Current user profile data
```javascript
{
  "id": "1",
  "name": "Astro User",
  "email": "user@example.com",
  "avatarUrl": "/uploads/avatar-1-1707300000000.jpg"
}
```

### PUT /api/user/profile
**Requires:** JWT token + multipart/form-data  
**Request Body:**
- `name` (string, optional): New user name (max 100 chars)
- `avatar` (file, optional): Image file (JPG/PNG, max 2MB)

**Returns:** Updated user data

**Example (curl):**
```bash
curl -X PUT http://localhost:4000/api/user/profile \
  -H "Authorization: Bearer your-token-here" \
  -F "name=Updated Name" \
  -F "avatar=@path/to/image.jpg"
```

### POST /api/auth/demo-token
**No auth required** (for testing only)  
**Returns:** JWT token valid for 7 days
```javascript
{ "token": "eyJhbGc..." }
```

---

## Frontend Setup

### Files Created
- **`public/profile.html`** - Complete profile page with edit modal
- **`public/api.js`** - API service for backend calls

### How to Use

#### 1. Access Profile Page
Visit: `http://localhost:4000/profile.html`

#### 2. Login (First Time)
- Page automatically fetches a demo token from `POST /api/auth/demo-token`
- Token stored in `localStorage` as `authToken`

#### 3. View Profile
Displays:
- Profile avatar (120px circle)
- User name
- Email address
- "Edit Profile" button

#### 4. Edit Profile
Click **"✏ Edit Profile"** → Modal opens with:
- Avatar preview
- File input (with drag-drop ready)
- Editable name field
- Read-only email field
- Save & Cancel buttons

#### 5. Upload Photo
- Select JPG or PNG (max 2MB)
- Instant preview shown before saving
- File size/type errors displayed below input

#### 6. Save Changes
- Click **"💾 Save"** to submit
- Loading state shown during upload
- Success message displays on completion
- Profile page avatar updates automatically

---

## API Service (api.js)

Access via: `window.ProfileAPI`

### Methods
```javascript
// Get current user
await window.ProfileAPI.getCurrentUser()

// Update profile
await window.ProfileAPI.updateProfile(name, avatarFile)

// Get demo token
await window.ProfileAPI.getDemoToken()

// Set auth token
window.ProfileAPI.setToken(token)
```

---

## Running the Server

### Development
```bash
npm start
```
Starts server on `http://localhost:4000`

### Access Points
- **Dashboard:** `http://localhost:4000/dashboard.html`
- **Profile:** `http://localhost:4000/profile.html`
- **API:** `http://localhost:4000/api/...`
- **Uploads:** `http://localhost:4000/uploads/...`

---

## Integration with Your App

### 1. Update Navbar to Link to Profile
Edit `public/dashboard.html`:
```html
<a href="/profile.html" class="nav-item">👤 Profile</a>
```

### 2. Update Avatar Display in Navbar
Add to your navbar after fetching user:
```javascript
const user = await fetch('/api/user/me', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

document.getElementById('navAvatar').src = user.avatarUrl;
```

### 3. Production Considerations
- Replace demo token endpoint with real login
- Use cloud storage (AWS S3, Firebase) instead of local uploads
- Add user registration/login flow
- Hash sensitive data
- Validate all inputs server-side
- Use HTTPS

---

## Customization

### Colors (Cosmic Theme)
Edit `<style>` in `public/profile.html`:
- Primary: `#1ED2FF` (cyan)
- Dark bg: `#0E1F3F`
- Text: `#B8C1D9`
- Accent: `#132456`

### File Size Limit
In `public/profile.html`:
```javascript
const MAX_FILE_SIZE = 2 * 1024 * 1024; // Change this
```

In `server.js` (multer config):
```javascript
limits: { fileSize: 2 * 1024 * 1024 }, // Change this
```

### Allowed File Types
Frontend: `accept="image/jpeg,image/png"` in file input  
Backend: `['image/jpeg','image/png']` in multer fileFilter

---

## Testing Checklist

- [ ] Server starts: `npm start`
- [ ] Profile page loads at `/profile.html`
- [ ] Profile displays user info
- [ ] "Edit Profile" button opens modal
- [ ] File input shows file picker
- [ ] Image preview updates on file select
- [ ] Validation errors show for invalid files
- [ ] Save uploads image and updates DB
- [ ] Success message appears
- [ ] Profile avatar updates
- [ ] Images accessible at `/uploads/...`
- [ ] Logout button works
- [ ] Token persists in localStorage

---

## Troubleshooting

### "Unauthorized - Missing/Invalid Token"
- Check `localStorage` has `authToken`
- Get new token: `await window.ProfileAPI.getDemoToken()`

### "File too large" or "Invalid format"
- Ensure file is JPG/PNG
- Must be under 2MB
- Check file input acceptance

### Images not saving
- Check `/uploads` folder exists
- Check server has write permissions
- Check file path in users.json is correct

### CORS errors
- Ensure `cors` dependency installed
- Check `app.use(cors())` in server.js

---

## Next Steps

1. **Connect to real database** (MongoDB, PostgreSQL)
2. **Implement user registration/login**
3. **Use cloud storage** for images
4. **Add image cropping** before upload
5. **Add email verification**
6. **Add profile fields** (bio, phone, etc.)
