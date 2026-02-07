const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'cosmic-watch-secret-key-2026';

// ===== FILE MANAGEMENT =====
function ensureUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2), 'utf8');
  }
}

function readUsers() {
  ensureUsersFile();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (err) {
    return {};
  }
}

function writeUsers(data) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Simple hash function (for demo - use bcrypt in production)
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + JWT_SECRET)
    .digest('hex');
}

// ===== MIDDLEWARE =====
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ===== MULTER SETUP =====
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `avatar-${req.user ? req.user.id : 'anon'}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG/PNG allowed'));
  }
});

// ===== AUTHENTICATION =====
app.post('/api/auth/signup', (req, res) => {
try {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

const users = readUsers();

const existingUser = Object.values(users).find(
      (u) => u.email === email || u.username === username
    );

    if (existingUser) {
  return res.status(409).json({ error: 'User already exists' });
}

const userId = crypto.randomUUID();
    const newUser = {
      id: userId,
      username: String(username).slice(0, 50),
      email: String(email).slice(0, 100),
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      avatarUrl: '/uploads/default-avatar.png',
      watchedAsteroids: [],
      alerts: []
    };

users[userId] = newUser;
writeUsers(users);

const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const users = readUsers();
    const user = Object.values(users).find((u) => u.username === username);

    if (!user || user.password !== hashPassword(password)) {
  return res.status(401).json({ error: 'Invalid username or password' });
}

const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// ===== USER ENDPOINTS =====
app.get('/api/user/me', authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const user = users[req.user.id];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      watchedAsteroids: user.watchedAsteroids || [],
      alerts: user.alerts || [],
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/user/profile', authMiddleware, upload.single('avatar'), (req, res) => {
  try {
    const users = readUsers();
    const user = users[req.user.id];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username } = req.body;

    if (username) {
      user.username = String(username).slice(0, 50);
    }

    if (req.file) {
      user.avatarUrl = `/uploads/${req.file.filename}`;
    }

    users[req.user.id] = user;
    writeUsers(users);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/user/watched-asteroid', authMiddleware, (req, res) => {
  try {
    const { asteroidId, asteroidName } = req.body;

    const users = readUsers();
    const user = users[req.user.id];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.watchedAsteroids) {
      user.watchedAsteroids = [];
    }

    const exists = user.watchedAsteroids.find((a) => a.id === asteroidId);
    if (exists) {
      return res.status(400).json({ error: 'Already watching this asteroid' });
    }

    user.watchedAsteroids.push({
      id: asteroidId,
      name: asteroidName,
      addedAt: new Date().toISOString()
    });

    users[req.user.id] = user;
    writeUsers(users);

    res.json({ message: 'Asteroid added to watchlist', watchedAsteroids: user.watchedAsteroids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/user/watched-asteroids', authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const user = users[req.user.id];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.watchedAsteroids || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/user/watched-asteroid/:asteroidId', authMiddleware, (req, res) => {
  try {
    const { asteroidId } = req.params;
    const users = readUsers();
    const user = users[req.user.id];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.watchedAsteroids = (user.watchedAsteroids || []).filter((a) => a.id !== asteroidId);

    users[req.user.id] = user;
    writeUsers(users);

    res.json({ message: 'Asteroid removed from watchlist', watchedAsteroids: user.watchedAsteroids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', server: 'Authentication API', timestamp: new Date().toISOString() });
});

// ===== START SERVER =====
// Try multiple ports if preferred port is occupied
const preferredAuthPorts = [process.env.PORT ? Number(process.env.PORT) : PORT, 4000, 4001, 5000, 4500];

function startAuthServerAtIndex(i = 0) {
  const portToTry = preferredAuthPorts[i] || 0;
  const server = app.listen(portToTry, () => {
    const actual = server.address().port;
    console.log(`🚀 Authentication Server running on http://localhost:${actual}`);
    console.log(`📊 Database: ${USERS_FILE}`);
    console.log(`🔐 Auth Endpoints: /api/auth/signup, /api/auth/login`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${portToTry} in use, trying next port...`);
      server.close?.();
      if (i + 1 < preferredAuthPorts.length) startAuthServerAtIndex(i + 1);
      else {
        console.error('No available ports for Authentication Server. Set PORT env var to an unused port.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startAuthServerAtIndex(0);
