// db.js
const mysql = require('mysql');
require('dotenv').config();

const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true // Cho phép chạy nhiều câu query 1 lúc nếu cần
};

let db;

function handleDisconnect() {
    db = mysql.createConnection(db_config);

    db.connect(function(err) {
        if (err) {
            console.log('❌ Lỗi khi kết nối MySQL:', err);
            setTimeout(handleDisconnect, 2000); // Thử kết nối lại sau 2 giây
        } else {
            console.log('✅ Đã kết nối MySQL thành công ID:', db.threadId);
        }
    });

    db.on('error', function(err) {
        console.log('⚠️ MySQL Error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // Kết nối lại nếu bị mất kết nối
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = db;