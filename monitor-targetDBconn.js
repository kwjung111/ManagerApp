const mysql = require('mysql2/promise');
const logger = require('./logger')

const config = {
  host: process.env.DB_TARGET_HOST,
  port: process.env.DB_TARGET_PORT,
  user: process.env.DB_TARGET_USER,
  password: process.env.DB_TARGET_PASS,
  database: process.env.DB_TARGET_DB,
  connectionLimit : 10,
  enableKeepAlive: true   //default:false
}

let dbcPool = mysql.createPool(config);

const check = async () => {
try{
  let res = await dbcPool.query(`select 1 as cnt;`);
  logger.info(' monitoring DB connected')  
}
catch(err){
  logger.error(err)
}
}
check()


const handleDisconnect = () =>{
  dbcPool.on('error', (err) => {
    logger.error(`db error ${err}, code : ${err.code} `)
    if(err.code === 'ECONNRESET'){
      dbcPool = mysql.createPool(config);
    }
  })
}

handleDisconnect()
// 연결 시작
module.exports = dbcPool
