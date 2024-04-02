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


module.exports = router;