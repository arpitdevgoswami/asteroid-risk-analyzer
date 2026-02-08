# 🚀 Render.com Deployment Guide

## Overview

Your Asteroid Risk Analyzer uses **two servers**:
- **Auth Server** (server.js): User authentication, login, signup
- **API Server** (server1.js): NASA asteroid data, proxy to auth

For **Render**, you have **two options**: deploy as one combined service or two separate services.

---

## Option 1: Single Service (Simpler) ⭐ RECOMMENDED

Deploy both servers in one Render Web Service.

### Step 1: Prepare Your Repository

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

Make sure these files exist:
- `start-render.js` ✅
- `package.json` with `start:render` script ✅
- `.env.example` (reference; don't commit secrets) ✅
- Both `server.js` and `server1.js` ✅

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `asteroid-risk-analyzer` (or your choice)
   - **Root Directory**: (leave blank - root of repo)
   - **Environment**: `Node`
   - **Build Command**:
     ```
     npm ci --production
     ```
   - **Start Command**:
     ```
     npm run start:render
     ```

### Step 3: Environment Variables

In Render dashboard, go to **Environment** tab and add:

| Key | Value | Example |
|-----|-------|---------|
| `NODE_ENV` | `production` | `production` |
| `PORT` | `4000` | `4000` |
| `JWT_SECRET` | Your secret key | `cosmic-watch-secret-key-2026` |
| `NASA_API_KEY` | Your NASA API key | `dA7AirbtYyrUyiW1sxLTIrw7qfj5meQhef73MtQ9` |
| `AUTH_URL` | Auto-set by Render | `http://localhost:4100` |

**Note**: Render automatically assigns `PORT`. The `start-render.js` script will use `PORT` for auth (typically 4000) and `PORT+100` for API (4100).

### Step 4: Deploy

Click **Create Web Service** and wait for deploy to finish.

The service will:
1. Install dependencies (production only - no puppeteer/react)
2. Start `npm run start:render`
3. Launch both servers on one dyno

**Access your app**:
```
https://your-service.onrender.com
```

Login/signup at that URL works through the internal proxy.

---

## Option 2: Two Separate Services (Advanced)

Deploy auth and API as separate Render services.

### Auth Service (server.js)

1. Create Web Service with:
   - **Start Command**: `npm run start:auth`
   - Add `JWT_SECRET` and `NASA_API_KEY` to Environment
   - Note the service URL, e.g., `https://your-auth-service.onrender.com`

2. Copy the Render service URL.

### API Service (server1.js)

1. Create Web Service with:
   - **Start Command**: `npm run start:api`
   - Add `PORT`, `NASA_API_KEY` to Environment
   - Add environment variable:
     | Key | Value |
     |-----|-------|
     | `AUTH_URL` | `https://your-auth-service.onrender.com` |

---

## Testing Locally Before Deploy

### Test Combined Launcher

```bash
# Terminal 1
npm run start:render
```

This starts both servers in one process. Access at `http://localhost:4000`.

### Test Separately (if needed)

```bash
# Terminal 1 - Auth Server
npm run start:auth

# Terminal 2 - API Server
PORT=8000 AUTH_URL=http://localhost:4000 npm run start:api
```

Access API at `http://localhost:8000` and it proxies auth to auth server.

---

## Troubleshooting

### "Auth server unreachable" on login

**Local**:
- Ensure both `npm run start:render` or separate `start:auth` and `start:api` commands are running.
- Check `http://localhost:4000/api/health` returns JSON.
- Check `http://localhost:8000/api/auth/health` proxies correctly.

**Render**:
- In Render dashboard, go to **Logs**.
- Check for error messages (connection refused, timeout, etc.).
- Verify `AUTH_URL` environment variable is set if using two services.
- Ensure `Port 4000 in use` doesn't appear; Render auto-assigns PORT.

### Long "Creating..." page

- Check logs for errors in `npm install`, startup, or runtime.
- If puppeteer or react takes too long to install, use `npm ci --production`.
- Render has a 30-minute build timeout; if it's longer, something's wrong.

### API returns 502 on `/api/asteroids`

- Check that auth server is running (test `/api/auth/health`).
- Verify NASA API key is valid in Environment variables.
- Check Render logs for timeout or connection errors.

---

## File Reference

- **start-render.js**: Combined launcher (runs both servers in one process).
- **.env.example**: Template for environment variables.
- **package.json**: Updated with `start:render` script.
- **server.js**: Auth server (loads .env, uses PORT env var).
- **server1.js**: API server (loads .env, uses AUTH_URL with fallback to localhost:4000).

---

## Useful Render Commands (Local)

```bash
# Install Render CLI (optional)
npm install -g @render/cli

# Deploy manually (if set up)
render deploy
```

---

## Next Steps

1. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Production-ready: add Render launcher and .env.example"
   git push
   ```

2. **Create Render account** at [render.com](https://render.com)

3. **Deploy**:
   - Go to Render dashboard
   - New Web Service → Connect GitHub
   - Choose your repo
   - Set Start Command to `npm run start:render`
   - Add Environment variables (see Step 3 above)
   - Click **Create Web Service**

4. **Test**:
   - Once deployed, visit `https://your-service.onrender.com`
   - Try login/signup
   - Check logs if issues

---

## Production Checklist

- [ ] `JWT_SECRET` set to a strong value in Render Environment
- [ ] `NASA_API_KEY` set and valid in Render Environment
- [ ] `NODE_ENV=production` set in Render Environment
- [ ] Build Command is `npm ci --production` (skip devDeps)
- [ ] Start Command is `npm run start:render`
- [ ] Repo is pushed to GitHub
- [ ] No `.env` file in repo (use Environment variables instead)
- [ ] Log in and test asteroid search on deployed URL

---

**Questions?** Check Render logs for hints on errors. Common issues are missing env vars, invalid API keys, or port conflicts.
