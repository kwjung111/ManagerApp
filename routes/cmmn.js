const express = require("express")
const router = express.Router();
const util = require("../util.js")
const cmmnService = require("../services/cmmnService.js")
const cmmnQuery = require("../queries/cmmn.js")


router
.get("/cmcd/:grpCd",(req,res)=>{
    const data = util.parseReqBody(req)
    cmmnService.getCmCd(data)
    .then((ret) => [
        res.send(ret)
    ])
})

module.exports = router;