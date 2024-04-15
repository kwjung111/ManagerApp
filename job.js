//데이터 캐싱, 주기적으로 수행
const monitoringDao = require('./dao/monitoringDao.js')
const logger = require('./logger.js')
const {wsJson,broadcast} = require('./wss.js')

const interval = 30000;

let mqInfo = {
    stdb : 0,
    stdb01 : 0
}
let tmsInfo = {
    count : 0
}
let appSndInfo = {
    tot_cnt : 0,
    comp_cnt : 0,
    alarm_yn : 0,
    comp_rt : 0
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

const getAppSndInfo = () => {
    monitoringDao.getAppSndInfo()
    .then( (res) => {

        const appSndInfos = res.result[0]
        
        appSndInfo.tot_cnt  = appSndInfos.TOT_CNT
        appSndInfo.comp_cnt = appSndInfos.COMP_CNT
        appSndInfo.alarm_yn = appSndInfos.ALARM_YN
        appSndInfo.comp_rt = appSndInfos.COMP_RT

    })
}

const getCustomInfo = async () => {
    
    const mqInfoPromise = monitoringDao.getMQInfo()
    const tmsInfoPromise = monitoringDao.getTmsInfo()
    const appSndInfoPromise = monitoringDao.getAppSndInfo()
    const naverInfoPromise = monitoringDao.getNaverInfo()

    const promises = [mqInfoPromise,tmsInfoPromise,appSndInfoPromise,naverInfoPromise]
    
    const [mqData, tmsData, appSndData, naverData ] = await Promise.all(promises)

    customInfo = {
        mqInfo     :  { stdb: mqData.result[0].stdb, stdb01: mqData.result[0].stdb01 },
        tmsInfo    :  { count: tmsData.result[0].count },
        appSndInfo :  { tot_cnt : appSndData.result[0].TOT_CNT, comp_cnt : appSndData.result[0].COMP_CNT,
                        alarm_yn : appSndData.result[0].ALARM_YN, comp_rt : appSndData.result[0].COMP_RT },
        naverInfo  :  { today: naverData.result[0].today, total: naverData.result[0].total },
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
                .message("monitoring message")
    broadcast(msg)
    console.log(customInfo)
},interval);

const getMonitoringResult = {
    getMQInfo : function(){
        return mqInfo
    },
    getTmsInfo : function(){
        return tmsInfo
    },
    getAppSndInfo : function(){
        return appSndInfo 
    },
    getNaverInfo : function(){
        return naverInfo
    },
    getCustomInfo : function() {
        return customInfo
    }
}

module.exports = getMonitoringResult;