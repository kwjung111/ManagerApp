const logger = require('../logger.js')
const util = require("../util.js")
const cmmnQuery = require('../queries/cmmn.js')

const dao = {
    getCmCd : (data) =>{
        const sqlData = [data.grpCd]
        const query = cmmnQuery.getCmCd()
        return util.transactionV2(query,sqlData)
    },
    getNasInfo : (data) => {
        const queryData = [data.text]
        const query = cmmnQuery.getNasInfo()
        return util.transactionV2(query, '%'+queryData+'%')
    }
}

module.exports = dao