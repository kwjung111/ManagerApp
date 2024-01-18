const dbc = require('../dbconn.js')
const logger = require('../logger.js')

const meetingQuery = {
    // 미팅 등록
    addShcd : function(data) {
        const query = `
        INSERT INTO MTNG (
            MTNG_NO
          , MTNG_PIN_YN
          , MTNG_PRTC
          , MTNG_PRGSS_CD
          , MTNG_STRT_DTM
          , MTNG_END_DTM
          , MTNG_TOT_TIME
          , MTNG_CNTNTS
          , MTNG_REG_DTM
          , MTNG_REG_MBR_SEQ
          , MTNG_USE_TF
        ) VALUES (
            (
              SELECT
                    COUNT(0) + 1  AS MTNG_NO
              FROM (
              SELECT '0'    AS SCHD_TP
                   , MTNG_SEQ   AS SCHD_SEQ
                   , MTNG_NO    AS SCHG_NO
                   , MTNG_REG_MBR_SEQ AS SCHD_REG_MBR_SEQ
              FROM MTNG
              WHERE MTNG_REG_MBR_SEQ = ${dbc.escape(data.userData.seq)}
              UNION ALL
              SELECT '1'    AS SCHD_TP
                   , PRJ_SEQ    AS SCHD_SEQ
                   , PRJ_NO     AS SCHD_NO
                   , PRJ_REG_MBR_SEQ AS SCHD_REG_MBR_SEQ
              FROM PRJ
              WHERE PRJ_REG_MBR_SEQ = ${dbc.escape(data.userData.seq)}
              ) A
            )
          , ${dbc.escape(data.SCHD_PIN_YN)}
          , ${dbc.escape(data.SCHD_PRTC)}
          , ${dbc.escape(data.SCHD_PRGSS_CD)}
          , DATE_FORMAT(${dbc.escape(data.SCHD_STRT_DTM)}, '%Y-%m-%d %H:%i:%s')
          , DATE_FORMAT(${dbc.escape(data.SCHD_END_DTM)}, '%Y-%m-%d %H:%i:%s')
          , ''
          , ${dbc.escape(data.SCHD_CNTNTS)}
          , DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
          , ${dbc.escape(data.userData.seq)}
          , 1
        )
        `
        logger.info("addMeetingQuery", {message:query})
        return query
    }
    
}


module.exports = meetingQuery