const mysql = require('mysql2/promise');



const dbcPool = mysql.createPool({
  host: process.env.DB_TARGET_HOST,
  port: process.env.DB_TARGET_PORT,
  user: process.env.DB_TARGET_USER,
  password: process.env.DB_TARGET_PASS,
  database: process.env.DB_TARGET_DB,
  enableKeepAlive: true   //default:false
});


// 연결 시작




module.exports = dbcPool
