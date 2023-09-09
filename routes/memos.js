const express = require("express")
const router = express.Router();
const util = require("../util.js")
const query = require("../query.js")
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
        broadcast(new wsJson({
            event:"addMemo"
        }).event())
    })
})
.delete("/:seq", async (req,res)=>{
    util.transaction(req,query.removeMemoQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        broadcast(new wsJson({
            event:"removeMemo"
        }).event())
    })
})

module.exports = router;