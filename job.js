//데이터 캐싱, 주기적으로 수행
const monitoringDao = require('./dao/monitoringDao.js')
const {wsJson,broadcast} = require('./wss.js')

const mqInfo = {
    stdb : 0,
    stdb01 : 0
}

const getMQInfo = () => {
    monitoringDao.getMQInfo()
    .then( (res) => {
        mqInfo.stdb = res.result[0].stdb;
        mqInfo.stdb01 = res.result[0].stdb01;
    })
}

getMQInfo();

setInterval(() => {
    getMQInfo();
    const msg = new wsJson("message")
                .message("MQ")
    console.log(msg)
    broadcast(msg)
},30000);

const getMonitoringResult = {
    getMQInfo : function(){
        return mqInfo
    }
}

module.exports = getMonitoringResult;