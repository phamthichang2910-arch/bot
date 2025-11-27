// middlewares/auth.js - Phiên bản fix lỗi Railway
require('dotenv').config(); // Đảm bảo load được biến môi trường

module.exports = function(req, res, next) {
  // Lấy user/pass từ input người dùng gửi lên
  var login_username = req.headers['username'] || req.body.username;
  var login_password = req.headers['password'] || req.body.password;

  // --- CẤU HÌNH TÀI KHOẢN ADMIN ---
  // Ưu tiên lấy từ Biến Môi Trường (trên Railway), nếu không có thì dùng mặc định 'admin'
  var valid_username = process.env.ADMIN_USERNAME || 'admin';
  var valid_password = process.env.ADMIN_PASSWORD || 'admin123'; 
  
  // --- DEBUG LOG (Để soi lỗi trên Railway - Xóa sau khi chạy ngon) ---
  console.log("--- DEBUG AUTH ---");
  console.log("Input User:", login_username);
  // console.log("Input Pass:", login_password); // Đừng log pass input
  console.log("Server User Expecting:", valid_username);
  console.log("Server Pass Expecting:", valid_password); 
  console.log("------------------");

  // So sánh
  if (login_username === valid_username && login_password === valid_password) {
    if (req.path === '/login') {
      res.status(200).send({ message: "Login success" });
    } else {
      next();
    }
  } else {
    console.log("❌ Đăng nhập thất bại: Sai thông tin");
    res.status(401).send({ message: "Unauthorized: Wrong username or password" });
  }
};