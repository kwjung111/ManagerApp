const logger = require('../logger.js')
const util = require("../util.js")
const memoQuery = require('../queries/memoQuery.js')

const dao = {
    getMemo : () =>{
        const query = memoQuery.getMemos()
        return util.transactionV2(query)
    },
    addMemo : (data) => {
        const sqlData = [data.postSeq,data.content,data.userData.seq]
        const query = memoQuery.addMemo()
        return util.transactionV2(query,sqlData)
    },
    deleteMemo : (data) => {
        const sqlData = [data.memoSeq]
        const query = memoQuery.deleteMemo()
        return util.transactionV2(query,sqlData)
    }
}

module.exports = dao