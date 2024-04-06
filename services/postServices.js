const postDao = require('../dao/postDao.js')
const util = require("../util.js")
const {wsJson,broadcast} = require('../wss.js')

const service = {
    getPost : async () => {
        const ret = await postDao.getPost()
        return ret
    },
    getPostsCount : async () => {
        const ret= postDao.getPostsCount()
        return ret
    },
    getPostWithSeq : async (data) => {
        const ret = await postDao.getPostWithSeq(data)
        return ret
    },
    getPostsTree : async () => {
        const ret = await postDao.getPostsTree()
        let posts = ret.result[0]
        let memos = ret.result[1]
        ret.result = util.makeTree(posts, memos, 0)
        return ret
    },
    addPost : async (data) => {
        const ret = await postDao.addPost(data)
        ret.result.postSeq = ret.result.insertId; //저장된 게시물넘버 리턴
        if (ret.ok == true) {
            const event = new wsJson("event")
                .event("POST", "posts", ret.result.insertId, req.body.UID, req.body.content)
            broadcast(event)
        }
        return ret
    },
    patchPost : async (data) => {
        const ret = await postDao.patchPost(data)
        if(ret.ok == true){
            broadcast(new wsJson("event").event("PATCH","posts",req.body.postSeq,req.body.UID))
        }
        return ret
    },
    deletePost : async (data) => {
        const ret = await postDao.deletePost(data)
        if (ret.ok == true) {
            broadcast(new wsJson("event").event("DELETE", "posts", req.params.postSeq, null, null))
        }
        return ret
    }



}
module.exports  = service