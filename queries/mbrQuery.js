const dbc = require('../dbconn.js')
const logger = require('../logger.js')

const query = {
    getMbrs : function (data) {
        return `
        SELECT
            MBR_SEQ
          , MBR_NM
        FROM MBR MB
        WHERE 1 = 1
          AND MBR_USE_TF = 1
          AND MBR_ROLE = 'USER'
        `
    },

    getCount : function (data) {
        return `
        SELECT
            COUNT(1)        AS MBR_COUNT
        FROM MBR MB
        WHERE 1 = 1
          AND MBR_USE_TF = 1
          AND MBR_ROLE = 'USER'
        `
    }
}

module.exports = query