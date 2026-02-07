// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/', express.static(path.join(__dirname, 'public')));

// const USERS_FILE = path.join(__dirname, 'users.json');

// function readUsers(){
//   return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
// }
// function writeUsers(data){
//   fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2),'utf8');
// }

// // Simple JWT auth middleware for demo purposes.
// // In real app, verify signature + expiry.
// const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
// function authMiddleware(req, res, next){
//   const auth = req.headers.authorization || '';
//   if(!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
//   const token = auth.slice(7);
//   try{
//     const payload = jwt.verify(token, JWT_SECRET);
//     req.user = payload; // expect payload { id }
//     next();
//   }catch(err){
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// }

// // multer setup: store in ./uploads, limit size 2MB
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = `avatar-${req.user ? req.user.id : 'anon'}-${Date.now()}${ext}`;
//     cb(null, name);
//   }
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
//   fileFilter: (req, file, cb) => {
//     const allowed = ['image/jpeg','image/png'];
//     if(allowed.includes(file.mimetype)) cb(null, true);
//     else cb(new Error('Only JPG/PNG allowed'));
//   }
// });

// // Demo route to get current user
// app.get('/api/user/me', authMiddleware, (req, res) => {
//   const users = readUsers();
//   const user = users[req.user.id];
//   if(!user) return res.status(404).json({ error: 'User not found' });
//   res.json(user);
// });

// // Update profile - name and optional avatar
// app.put('/api/user/profile', authMiddleware, upload.single('avatar'), (req, res) => {
//   try{
//     const users = readUsers();
//     const user = users[req.user.id];
//     if(!user) return res.status(404).json({ error: 'User not found' });

//     const { name } = req.body;
//     if(name) user.name = String(name).slice(0, 100);

//     if(req.file){
//       // save accessible URL
//       user.avatarUrl = `/uploads/${req.file.filename}`;
//     }

//     users[req.user.id] = user;
//     writeUsers(users);

//     res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });
//   }catch(err){
//     console.error(err);
//     res.status(500).json({ error: err.message || 'Server error' });
//   }
// });

// // Simple route to mint a demo token (not for production)
// app.post('/api/auth/demo-token', (req, res) => {
//   // issue token for user id 1
//   const token = jwt.sign({ id: '1' }, JWT_SECRET, { expiresIn: '7d' });
//   res.json({ token });
// });

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
