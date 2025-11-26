// config/sequelize.js
const { Sequelize } = require('sequelize');

// Cách ưu tiên: Dùng DATABASE_URL từ Railway (luôn có khi attach MySQL plugin)
if (process.env.DATABASE_URL) {
  console.log('Đang kết nối MySQL qua DATABASE_URL (Railway mode)');

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false, // tắt log SQL lằng nhằng
    dialectOptions: {
      ssl: {
        require: true,          // Railway bắt buộc bật SSL
        rejectUnauthorized: false // bỏ qua cert tự ký
      }
    },
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  module.exports = sequelize;
  return;
}

// Nếu không có DATABASE_URL → chạy local (development)
console.log('Không tìm thấy DATABASE_URL → dùng config local');

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env]; // config/config.js hoặc config.json

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    dialectOptions: config.dialectOptions || {},
    define: {
      underscored: true,
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

module.exports = sequelize;