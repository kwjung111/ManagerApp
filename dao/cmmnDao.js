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
        const srchTp = data.srchTp
        let queryData;

        if(srchTp == '0') {
            queryData = ['%'+data.text+'%', '%'+data.text+'%', '%'+data.text+'%']
        }
        else if(srchTp == '1'){
            queryData = ['%'+data.text+'%', null, null]
        }
        else if(srchTp == '2'){
            queryData = [null, '%'+data.text+'%', null]
        }
        else if(srchTp == '3'){
            queryData = [null, null, '%'+data.text+'%']
        }

        const query = cmmnQuery.getNasInfo()
        return util.transactionV2(query, queryData)
    }
}

module.exports = dao