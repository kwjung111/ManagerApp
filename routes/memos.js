const express = require("express")
const router = express.Router();
const util = require("../util.js")
const memoQuery = require("../queries/memoQuery.js")
const {wsJson,broadcast} = require('../wss.js')

router
.get("/",(req,res)=>{
    util.transaction(req,memoQuery.getMemos)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
    })
})
.post("/",(req,res)=>{
    util.transaction(req,memoQuery.addMemoQuery)
    .then( (ret)=> {
        ret.result.postSeq = req.body.postSeq
        res.send(ret)
        if(ret.ok == true){
            broadcast(new wsJson("event")
            .event("POST","memos",req.body.memoSeq,req.body.UID,req.body.content,{postSeq:req.body.postSeq}))
        }
    })
})
.delete("/:memoSeq", async (req,res)=>{
    util.transaction(req,memoQuery.removeMemoQuery)
    .then( (ret)=> {
        res.send(ret)
        broadcast(new wsJson("event")
        .event("DELETE","memos",req.body.memoSeq,null,null))
    })
})

module.exports = router;