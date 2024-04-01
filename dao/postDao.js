const logger = require('../logger.js')
const util = require("../util.js")
const postQuery = require('../queries/postQuery.js')

const dao = {
    getPost: (data) => {
        sqlData = [data.postSeq]
        query = postQuery.getPost()
        //return promise
        return util.transactionV2(sqlData,query)
    }
}

module.exports = dao