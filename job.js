//데이터 캐싱, 주기적으로 수행
const monitoringDao = require('./dao/monitoringDao.js')
const logger = require('./logger.js')
const {wsJson,broadcast} = require('./wss.js')

const interval = 5000;

let mqInfo = {
    stdb : 0,
    stdb01 : 0
}
let tmsInfo = {
    stdb : 0,
    stdb01 : 0
}
let naverInfo = {
    today : 0,
    total : 0
}

let customInfo = {}

const getMQInfo = () => {
    monitoringDao.getMQInfo()
    .then( (res) => {

        const mqInfos = res.result[0]

        mqInfo.stdb = mqInfos.stdb;
        mqInfo.stdb01 = mqInfos.stdb01;
    })
    .cathch((error) => {
        logger.error("mq monitoring Error : ", error)
    })
}

const getTmsInfo = () => {
    monitoringDao.getTmsInfo()
    .then( (res) => {

        const tmsInfos = res.result[0]

        tmsInfo.stdb = tmsInfos.stdb;
        tmsInfo.stdb01 = tmsInfos.stdb01; 
    })
    .cathch((error) => {
        logger.error("mq monitoring Error : ", error)
    })
}

const getNaverInfo = () => {
    monitoringDao.getNaverInfo()
    .then( (res) => {
        
        const naverInfos = res.result[0]

        naverInfo.today - naverInfos.today
        naverInfo.total = naverInfos.total
    })
    .cathch((error) => {
        logger.error("mq monitoring Error : ", error)
    })
}

const getCustomInfo = async () => {
    
    const mqInfoPromise = monitoringDao.getMQInfo()
    const tmsInfoPromise = monitoringDao.getTmsInfo()
    const naverInfoPromise = monitoringDao.getNaverInfo()

    const promises = [mqInfoPromise,tmsInfoPromise,naverInfoPromise]
    
    const [mqData, tmsData, naverData ] = await Promise.all(promises)

    customInfo = {
        mqInfo: { stdb: mqData.result[0].stdb, stdb01: mqData.result[0].stdb01 },
        tmsInfo: { stdb: tmsData.result[0].stdb, stdb01: tmsData.result[0].stdb01 },
        naverInfo: { today: naverData.result[0].today, total: naverData.result[0].total },
    }
}


const initailizeMonitoring = () => {
    getCustomInfo.then()


}
//initialize
getCustomInfo();

setInterval(() => {
    getCustomInfo();
    const msg = new wsJson("message")
                .message("MQ")
    broadcast(msg)
    logger.debug('monitoring', {label : "monitoring"})
},interval);

const getMonitoringResult = {
    getMQInfo : function(){
        return mqInfo
    },
    getTmsInfo : function(){
        return tmsInfo
    },
    getNaverInfo : function(){
        return naverInfo
    },
    getCustomInfo : function() {
        return customInfo
    }
}

module.exports = getMonitoringResult;