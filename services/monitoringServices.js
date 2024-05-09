const monitoringDao = require('../dao/monitoringDao.js')

const monitoringService = {
    getTranInfoDetail : async (data) => {
        const date = data.date
    
        const dateArr = [date,date,date,date,date,date,date,date]
        const ret = await monitoringDao.getTranInfoDetail(dateArr)
        console.log("ret is :")
        console.log(ret)
        return ret
    }
}


module.exports = monitoringService