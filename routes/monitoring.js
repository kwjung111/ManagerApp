const express = require("express")
const router = express.Router();
const util = require("../util.js")
const cache = require("../monitoringCache.js")
const monitoringService = require("../services/monitoringServices.js");


router
.get('/MQInfo',async (req,res) => {
    let mqInfo = await cache.getMQInfo()
    res.send(mqInfo)
})
.get('/TmsInfo',async (req,res) => {
    let tmsInfo = await cache.getTmsInfo()
    res.send(tmsInfo)
})
.get('/NaverInfo',async (req,res) => [
    //let naverInfo = cache.
])
.get('/customInfo', async (req, res) => {
    let customInfo = await cache.getCustomInfo()
    res.send(customInfo)
})
.get('/tranInfoDetail/:date', async (req, res) => {
    const data = util.parseReqBody(req)

    const date = data?.date

    const valid = isValidDateYYYYMMDD(date)

    if(!valid){
        res.send("날짜를 다시 확인해주세요")
        return;
    } 

    const tranInfoDetail = await monitoringService.getTranInfoDetail(data)
    res.send(tranInfoDetail)
})
.get('/tranInfo', async(req,res) => {
    const data = util.parseReqBody(req)
    const startDate = data.startDate
    const endDate = data.endDate
    
    if( !isValidDateYYYYMMDD(startDate) || !isValidDateYYYYMMDD(endDate )){
        res.send("날짜를 다시 확인 해주세요.")
        return;
    }

    const tranInfoDailySummary = await monitoringService.getDailyTranInfo(startDate,endDate)
    res.send(tranInfoDailySummary)
})
.get('/appSndInfo', async(req,res) => {
    const data = util.parseReqBody(req)
    const startDate = data.startDate
    const endDate = data.endDate

    if( !isValidDateYYYYMMDD(startDate) || !isValidDateYYYYMMDD(endDate )){
        res.send("날짜를 다시 확인 해주세요.")
        return;
    }
    const appSndInfo = await monitoringService.getDailyAppSndInfoByDateRange(startDate, endDate)

    res.send(appSndInfo)
})
.get('/appSndInfo/:date', async (req,res) => {
    const data = util.parseReqBody(req)

    const date = data?.date

    const valid = isValidDateYYYYMMDD(date)
    if(!valid){
        res.send("날짜를 다시 확인해주세요")
        return;
    }

    const appSndInfo = await monitoringService.getDailyAppSndInfo(data)
    res.send(appSndInfo)
})

.get('/appSndInfoHeader/:date', async(req, res) => {
    const data = util.parseReqBody(req)

    const date = data?.date

    const valid = isValidDateYYYYMMDD(date)
    if(!valid){
        res.send("날짜를 다시 확인해주세요")
        return;
    }

    const appSndInfoHeader = await monitoringService.getDailyAppSndInfoHeader(data)
    res.send(appSndInfoHeader)
})
.get('/appSndInfoStr/:num', async(req, res) => {
    const data = util.parseReqBody(req)

    const num = data?.num

    const appSndInfoByStr = await monitoringService.getDailyAppSndInfoByStrCd(num)
    res.send(appSndInfoByStr)
})
.get('/tranInfoDaily/:date', async(req,res) => {
    const data = util.parseReqBody(req)
    const date = data?.date

    const valid = isValidDateYYYYMMDD(date)
    if(!valid){
        res.send("날짜를 다시 확인해주세요")
        return;
    }
    
    const tranInfoDaily = await monitoringService.getDailyTranInfo(data)
    res.send(tranInfoDaily)
})

//확인 필요
function isValidDateYYYYMMDD(date) {

    if(date === undefined) return false;
    if(date === null) return false;
    // 정규식을 사용하여 기본 형식 확인
    if (!/^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/.test(date)) {
        return false;
    }

    return true;
}


module.exports = router;