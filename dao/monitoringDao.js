const logger = require('../logger.js')
const util = require("../util.js")
const monitoringQuery = require('../queries/monitoringQuery.js')

const dao = {
    getMQInfo: (data) => {
        const query = monitoringQuery.getMQInfo()
        //return promise
        return util.transaction_Monitoring(query,null)
    },
    getTmsInfo : (data) => {
        const query = monitoringQuery.getTmsInfo()
        return util.transaction_Monitoring(query,null) 
    },
    getAppSndInfo : (data) => {
        const query = monitoringQuery.getAppSndInfo()
        return util.transaction_Monitoring(query,null)
    },
    getNaverInfo : (data) => {
        const query = monitoringQuery.getNaverInfo()
        return util.transaction_Monitoring(query,null)
    },
    getTranInfoDetail: (data) => {
        const query = monitoringQuery.getTranInfoDetail();
        return util.transaction_Monitoring(query,data)
    },
    getDailyAppSndInfoByDay : (data) => {
        const query = monitoringQuery.getDailyAppSndInfoByDay();
        return util.transaction_Monitoring(query,data)
    },
    getDailyAppSndInfoByDateRange : (data) => {
        const query = monitoringQuery.getDailyAppSndInfoByDateRange();
        return util.transaction_Monitoring(query, data)
    },
    getDailyAppSndInfoHeaderByDay : (data) => {
        const query = monitoringQuery.getDailyAppSndInfoHeaderByDay();
        return util.transaction_Monitoring(query,data)
    },
    getDailyTranInfoByDateRange: (data) => {
        const query = monitoringQuery.getDailyTranInfoByDateRange();
        const ret =  util.transactionV2(query,data)
        return ret
    }
    
}

module.exports = dao