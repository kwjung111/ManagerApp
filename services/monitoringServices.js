const monitoringDao = require('../dao/monitoringDao.js')

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
}


module.exports = monitoringService