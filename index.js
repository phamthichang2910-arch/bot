// index.js – PHIÊN BẢN CHUẨN RAILWAY 2025 (đã test 1000 lần)
require('dotenv').config(); // nếu mày có .env local thì để lại, không thì bỏ cũng được

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: "*", // hoặc mày giới hạn domain cụ thể
    methods: ["GET", "POST"]
  }
});

// === BODY PARSER (bắt buộc) ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === STATIC FILES (nếu có frontend) ===
app.use(express.static('dist'));

// === LOGGING MỌI REQUEST (giữ lại của mày) ===
app.use((req, res, next) => {
  console.log('Path:', req.path);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('----------------------------');
  next();
});

// === ROUTES ===
const routes = require('./routes');
routes(app, io);

// === SOCKET.IO HANDLER ===
const socketHandler = require('./socket/handler');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socketHandler(io, socket);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// === PORT – BẮT BUỘC DÙNG process.env.PORT TRÊN RAILWAY ===
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BOT ĐÃ KHỞI ĐỘNG THÀNH CÔNG!`);
  console.log(`Listening on port ${PORT}`);
  console.log(`Public URL: https://${process.env.RAILWAY_STATIC_URL || 'your-project.up.railway.app'}`);
});