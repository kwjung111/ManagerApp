const express = require("express")
const router = express.Router();
const util = require("../util.js")
const query = require("../query.js")
const {wsJson,broadcast} = require('../wss.js')


router
.get("/",(req,res)=>{
    util.transaction(req,query.getPosts)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
    })
})
.post("/",(req,res)=>{
    util.transaction(req,query.addPostQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        broadcast(new wsJson({
            event:"addPost"
        }).event())
    })
})
.patch('/prgState',(req,res)=>{
    util.transaction(req,query.changePrgState)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        broadcast(new wsJson({
            event:"prgState"
        }).event())
    })
})
.delete("/:postSeq",async (req,res)=>{
    util.transaction(req,query.removePostQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        broadcast(new wsJson({
            event:"removePost"
        }).event())
    })

})

module.exports = router;