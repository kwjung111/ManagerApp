const redis = require('redis')
const logger = require('./logger.js')
const util = require('./util.js')
const {wsJson,broadcast} = require('./wss.js')

const channel = 'Monitoring';

async function initClient(){
    const client = await redis.createClient({
        url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    }).on('connect',() => {
        logger.info(" redis connected ")
    } )
    .on('error', err => {
        logger.error("redis connection error : ",err)
    }).connect()


    //sub channels
    client.subscribe(channel,monitoringListener)
    client.subscribe('test',(message, channel) => logger.info(`channel : ${channel}, test message : ${message}`))
}

const monitoringListener = (message, _ ) => {
    logger.info(`monitoring message : ${message}`)

    //parse message

    const msg = new wsJson("message")
    .message("monitoring message")
    
    broadcast(msg)
    logger.info(msg)
}

module.exports = initClient