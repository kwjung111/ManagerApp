const express = require("express")
const router = express.Router();
const util = require("../util.js")
const memoService = require("../services/memoServices.js")

router
.get("/",(req,res)=>{
    //const data = util.parseReqBody(req)
    memoService.getMemo()
    .then((ret) =>{
        res.send(ret)
    })
})
.post("/",(req,res)=>{
    const data = util.parseReqBody(req)
    memoService.addMemo(data)
    .then((ret) => {
        res.send(ret)
    })
})
.delete("/:memoSeq", async (req,res)=>{
    const data = util.parseReqBody(req)
    memoService.deleteMemo(data)
    .then((ret) => {
        res.send(ret)
    })
})

module.exports = router;