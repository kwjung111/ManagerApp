const express = require("express")
const router = express.Router();
const util = require("../util.js")
const job = require("../job.js")
const monitoringDao = require('../dao/monitoringDao.js')


router
.get('/MQInfo',(req,res) => {
    let mqInfo = job.getMQInfo()
    res.send(mqInfo)
})
.get('/TmsInfo',(req,res) => {
    let tmsInfo = job.getTmsInfo()
    res.send(tmsInfo)
})
.get('/NaverInfo',(req,res) => [
    //let naverInfo = job.
])
.get('/customInfo', (req, res) => {
    let customInfo = job.getCustomInfo()
    res.send(customInfo)
})

module.exports = router;