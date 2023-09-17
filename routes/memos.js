const express = require("express")
const router = express.Router();
const util = require("../util.js")
const query = require("../queries/query.js")
const {wsJson,broadcast} = require('../wss.js')

router
.get("/",(req,res)=>{
    util.transaction(req,query.getMemos)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
    })
})
.post("/",(req,res)=>{
    util.transaction(req,query.addMemoQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        if(ret.ok == true){
            broadcast(new wsJson("event").event("POST","memos",req.body.memoSeq,req.body.UID,req.body.content))
        }
    })
})
.delete("/:memoSeq", async (req,res)=>{
    util.transaction(req,query.removeMemoQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        broadcast(new wsJson("event").event("DELETE","memos",req.body.memoSeq,null,null))
    })
})

module.exports = router;