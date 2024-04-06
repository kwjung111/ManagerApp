const logger = require('../logger.js')
const util = require("../util.js")
const postQuery = require('../queries/postQuery.js')
const memoQuery = require('../queries/memoQuery.js')


const dao = {
    getPost : () => {
        const query = postQuery.getPosts();
        return util.transactionV2(query)
    },
    getPostsCount : () => {
        const query = postQuery.getPostsCount();
        return util.transactionV2(query)
    },
    getPostsTree : () =>{
        const pstQuery = postQuery.getPosts();
        const memQuery = memoQuery.getMemos();
        const queries = [pstQuery, memQuery];
        return util.transactionsV2(queries,null,true)
    },
    getPostWithSeq: (data) => {
        const sqlData = [data.postSeq]
        const query = postQuery.getPost()
        //return promise
        return util.transactionV2(query,sqlData)
    },
    addPost: (data) => {
        const sqlData = [data.content,data.inCharge,data.postCd,data.userData.seq]
        const query = postQuery.addPost()
        return util.transactionV2(query,sqlData)
    },
    patchPost : (data) =>{
        const sqlData = [data.postCd,data.cntns,data.inCharge,data.prgCd,data.prgCd,data.prgCd,data.prgCd,data.prgCd,data.rsnPndg,data.postSeq]
        const query = postQuery.patchPost()
        return util.transactionV2(query,sqlData)
    },
    deletePost: (data) => {
        const sqlData = [data.postSeq]
        const query = postQuery.removePost()
        return util.transactionV2(query,sqlData)
    }
}

module.exports = dao