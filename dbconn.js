const mysql = require('mysql2/promise');



const dbcPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB,
});


// 연결 시작

module.exports = dbcPool
