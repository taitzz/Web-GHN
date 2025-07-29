require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'sa',  // Tên user đăng nhập SQL Server
    password: process.env.DB_PASSWORD || 'chamhoclen',  // Mật khẩu SQL Server
    server: process.env.DB_SERVER || 'DESKTOP-SOILIC8\TAIVU', // Tên server SQL
    database: process.env.DB_NAME || 'DOAN', // Tên database

    options: {
        encrypt: false, // Nếu sử dụng localhost hoặc máy chủ không hỗ trợ SSL
        trustServerCertificate: true // Cho phép sử dụng chứng chỉ không tin cậy (cần nếu dùng localhost)
    }
};

console.log(config);

// Kết nối database
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Kết nối SQL Server thành công!');
        return pool;
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối database: ', err);
        process.exit(1);
    });

module.exports = { sql, poolPromise };
