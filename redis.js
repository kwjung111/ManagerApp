const redis = require('redis')
const logger = require('./logger.js')
const {wsJson,broadcast} = require('./wss.js');
const RedisMessageDTO = require('./dto/RedisMessageDTO.js');
const MQResponseDTO = require('./dto/MQResponseDTO.js');
const cache = require('./monitoringCache.js')

const channel = 'srList';

async function initClient(){
    const client = await redis.createClient({
        url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    }).on('connect',() => {
        logger.info(" redis connected ")
    } )
    .on('error', err => {
        logger.error("redis connection error : ",err)
    }).connect()

    //Suscribe
    client.subscribe(channel, async (message) => {
        
        try{
            const buffer = Buffer.from(message, 'binary'); // 메시지를 버퍼로 변환
            const messageObj = JSON.parse(buffer);
            const redisMsg = new RedisMessageDTO(messageObj.sender, messageObj.code, messageObj.content); 
            const content = redisMsg.content;
            
            //TODO code 별 handler 추가 필요..
            if(redisMsg.code == 'MQ-001' || redisMsg.code == 'TEST-001'){
                const mqResponse = new MQResponseDTO(content.connections, content.queues)
                cache.setMqWebInfo(mqResponse)
                await cache.refresh();
                cache.broadcast();
            }
            
        }
        catch(err){
            logger.error(`Failed to deserialize & parse message:, ${err}`)
        }

    })
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