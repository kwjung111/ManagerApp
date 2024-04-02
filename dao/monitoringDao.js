const logger = require('../logger.js')
const util = require("../util.js")
const monitoringQuery = require('../queries/monitoringQuery.js')

const dao = {
    getMQInfo: (req) => {
        //data =  util.parseReqBody(req)
        
        query = monitoringQuery.getMQInfoQuery()
        //return promise
        return util.transaction_Monitoring(query,null)
    }
}

module.exports = dao