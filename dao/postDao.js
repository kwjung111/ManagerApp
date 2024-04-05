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
        console.log(data)
        sqlData = [data.postSeq]
        query = postQuery.getPost()
        //return promise
        return util.transactionV2(query,sqlData)
    },
    addPost: (data) => {
        sqlData = [data.content,data.inCharge,data.postCd,data.userData.seq]
        query = postQuery.addPost()
        return util.transactionV2(query,sqlData)
    },
    deletePost: (data) => {
        sqlData = [data.postSeq]
        query = postQuery.removePost()
        return util.transactionV2(query,sqlData)
    }
}

module.exports = dao