const monitoringDao = require('../dao/monitoringDao.js')
const util = require('../util.js')

const monitoringService = {
    getTranInfoDetail : async (data) => {
        const date = data.date
    
        const dateArr = [date,date,date,date,date,date,date,date]
        const ret = await monitoringDao.getTranInfoDetail(dateArr)
        return ret
    },
    getDailyTranInfo : async (start,end) => {
        const dateRange = [start,end]
        const ret = await monitoringDao.getDailyTranInfoByDateRange(dateRange)
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
        const dateRange = [start,end,start,end]
        const ret = await monitoringDao.getDailyAppSndInfoByDateRange(dateRange)
        return ret
    },
}


module.exports = monitoringService