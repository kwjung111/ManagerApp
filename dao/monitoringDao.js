const logger = require('../logger.js')
const util = require("../util.js")
const monitoringQuery = require('../queries/monitoringQuery.js')

const dao = {
    getMQInfo: (req) => {
        //data =  util.parseReqBody(req)
        
        const query = monitoringQuery.getMQInfo()
        //return promise
        return util.transaction_Monitoring(query,null)
    },
    getTmsInfo : (req) => {
        const query = monitoringQuery.getTmsInfo()
        return util.transaction_Monitoring(query,null) 
    },
    getAppSndInfo : (req) => {
        const query = monitoringQuery.getAppSndInfo()
        return util.transaction_Monitoring(query,null)
    },
    getNaverInfo : (req) => {
        const query = monitoringQuery.getNaverInfo()
        return util.transaction_Monitoring(query,null)
    }
}

module.exports = dao