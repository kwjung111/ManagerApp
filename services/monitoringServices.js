const monitoringDao = require('../dao/monitoringDao.js')
const util = require('../util.js')

const monitoringService = {
    getTranInfoDetail : async (data) => {
        const date = data.date
    
        const dateArr = [date,date,date,date,date,date,date,date]
        const ret = await monitoringDao.getTranInfoDetail(dateArr)
        return ret
    },
    getDailyAppSndInfoHeader : async(data) => {
        const date = data.date

        const dateArr = [date,date,date,date]
        const ret = await monitoringDao.getDailyAppSndInfoHeaderByDay(dateArr)
        return ret
    },
    getDailyAppSndInfo : async (data) => {
        const date = data.date

        const dateArr = [date,date,date,date]
        const ret = await monitoringDao.getDailyAppSndInfoByDay(dateArr)
        return ret
    },
    getDailyAppSndInfoByDateRange : async(start,end) => {
        const dateArr = [start,end,start,end]
        const ret = await monitoringDao.getDailyAppSndInfoByDateRange(dateArr)
        return ret
    },
    getDailyAppSndInfoByStrCd : async(num) => {
        const numArr = [num, num]
        const ret = await monitoringDao.getDailyAppSndInfoByStrCd(numArr)
        return ret
    },
    // 병렬 처리
    getDailyTranInfo : async (data) => {
        const date = data.date

        const dateArr = util.getLastDays(date,3)
        const promiseArr = []
        const ret = []

        for(targetDate of dateArr){
            const dtArr = [targetDate,targetDate,targetDate,targetDate,targetDate,targetDate]
            promiseArr.push(monitoringDao.getDailyTranInfoByDaySTDB(dtArr)) 
            promiseArr.push(monitoringDao.getDailyTranInfoByDaySTDB01(dtArr))
        }

        const queryResArr = await Promise.all(promiseArr)

        for (let i = 0 ; i < queryResArr.length; i++){
            const queryRes = queryResArr[i]

            const val = queryRes.result[0];
            ret.push(val);
        }

        return ret
    }
}


module.exports = monitoringService