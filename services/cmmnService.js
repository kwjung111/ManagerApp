const cmmnDao = require('../dao/cmmnDao.js')
const {wsJson,broadcast} = require('../wss.js')

const cmmnService = {
    getCmCd : async (data) => {
        const ret = await cmmnDao.getCmCd(data)
        return ret
    },
    getNasInfo : async (data) => {
        const ret = await cmmnDao.getNasInfo(data)
        return ret
    }
}

module.exports = cmmnService