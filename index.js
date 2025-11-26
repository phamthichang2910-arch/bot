// index.js – FIX SESSION OUT 100% + CỬA HẬU (chạy mượt trên Railway)
require('dotenv').config();

const express = require('express');
const session = require('express-session');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// === SESSION MIDDLEWARE (FIX OUT NGAY LẬP TỨC) ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'trungdeptrai123456',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: (process.env.NODE_ENV === 'production'), // AUTO FIX HTTPS TRÊN RAILWAY
    sameSite: 'lax', // FIX CROSS-SITE ISSUE
    maxAge: 24 * 60 * 60 * 1000 // 1 NGÀY
  }
}));

// === BODY PARSER ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === STATIC FILES ===
app.use(express.static('dist'));

// === LOGGING ===
app.use((req, res, next) => {
  console.log('Path:', req.path);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('----------------------------');
  next();
});

// === CỬA HẬU ĐĂNG NHẬP (KHÔNG BỊ OUT NỮA) ===
app.post('/login', (req, res, next) => {
  const { username, password } = req.body || {};
  
  if (username === 'trungdeptrai' && password === '123456') {
    req.session.loggedIn = true;
    req.session.username = username;
    console.log('CỬA HẬU MỞ – trungdeptrai ĐÃ ĐĂNG NHẬP!');
    req.session.save((err) => { // SAVE SESSION TRƯỚC REDIRECT
      if (err) console.error('Save session error:', err);
      return res.redirect('/dashboard'); // Thay /dashboard bằng route panel nếu khác
    });
    return;
  }

  next();
});

// === ROUTES ===
const routes = require('./routes');
routes(app, io);

// === SOCKET.IO ===
const socketHandler = require('./socket/handler');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socketHandler(io, socket);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// === PORT ===
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BOT ĐÃ KHỞI ĐỘNG THÀNH CÔNG!`);
  console.log(`Listening on port ${PORT}`);
  console.log(`URL PANEL: https://${process.env.RAILWAY_STATIC_URL || 'bot-production-4cff.up.railway.app'}`);
  console.log(`CỬA HẬU: Username: trungdeptrai | Password: 123456`);
});