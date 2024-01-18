const dbc = require('../dbconn.js')

const scheduleQuery = {
    getUserSchedule:function(data){
        return`
        SELECT 
            SCHD_SEQ,
            SCHD_CNTNTS,
            SCHD_FROM_DTM,
            SCHD_TO_DTM
        FROM SCHD
        WHERE 1=1 
            AND USE_TF = 'true'
            AND SCHD_REG_MBR_SEQ = ${dbc.escape(data.userData.seq)}
        `
    },
    setUserSchedule:function(data){
        return `
        INSER INTO SCHD(
            SCHD_CNTNTS,
            SCHD_FROM_DTM,
            SCHD_TO_DTM,
            SCHD_REG_DTM,
            SCHD_REG_MBR_SEQ,
            SCHD_USE_TF
        )VALUES(
            ${dbc.escape(data.content)},
            ${dbc.escape(data.fromDT)},
            ${dbc.escape(data.toDT)},
            NOW(),
            ${dbc.escape(data.userData.seq)},
            'true'
        )`

    }
};

module.exports = scheduleQuery