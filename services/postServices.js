const postDao = require('../dao/postDao.js')
const util = require("../util.js")
const {wsJson,broadcast} = require('../wss.js')

const service = {
    getPost : () => {
        return postDao.getPost()
    },
    getPostsCount : () => {
        return postDao.getPostsCount()
    },
    getPostWithSeq : (req) => {
        dto =  util.parseReqBody(req)
        return postDao.getPostWithSeq(dto)
    },
    getPostsTree : () => {
        return postDao.getPostsTree()
        .then((ret) => {
            let posts = ret.result[0]
            let memos = ret.result[1]
            
            console.log(posts)

            ret.result = util.makeTree(posts,memos, 0)
            return ret
        })
    },
    addPost : (req) => {
        dto = util.parseReqBody(req)
        return postDao.addPost(dto)
        .then((ret) => {
            ret.result.postSeq = ret.result.insertId       //저장된 게시물넘버 리턴
            if(ret.ok == true){
                const event = new wsJson("event")
                .event("POST","posts",ret.result.insertId,req.body.UID,req.body.content)
                broadcast(event)
            }
            return ret
        })
    },
    deletePost : (req) => {
        dto = util.parseReqBody(req)
        return postDao.deletePost(dto)
        .then( (ret) => {
            if(ret.ok == true){
                broadcast(new wsJson("event").event("DELETE","posts",req.params.postSeq,null,null))
            }
            return ret
        })
    }



}
module.exports  = service