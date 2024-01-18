const express = require("express")
const router = express.Router();
const util = require("../util.js")
const cmmnQuery = require("../queries/cmmn.js")


router
.get("/cmcd/:grpCd",(req,res)=>{
    util.transaction(req, cmmnQuery.getCmCd)
    .then((ret)=> {
        res.send(ret)
    })
})

module.exports = router;