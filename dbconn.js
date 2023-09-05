const mysql = require('mysql2/promise');



const dbcPool = mysql.createPool({
  host: '15.164.4.54',
  port: '33061',
  user: 'root',
  password: '1234',
  database: 'Dev',
});


// 연결 시작

module.exports = dbcPool
