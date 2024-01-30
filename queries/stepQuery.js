const dbc = require('../dbconn.js')
const logger = require('../logger.js')

const stepQuery = {
    
    // 프로젝트 - 단계 생성
    addStep : function(data) {
        const query = `
        INSERT INTO STEP (
            STEP_PRJ_SEQ
          , STEP_NM 
          , STEP_STRT_DTM
          , STEP_END_DTM
          , STEP_CNTNTS
          , STEP_REG_DTM
          , STEP_REG_MBR_SEQ
          , STEP_USE_TF
        ) VALUES (
            ${dbc.escape(data.SCHD_SEQ)}
          , ${dbc.escape(data.STEP_NM)}
          , DATE_FORMAT(${dbc.escape(data.STEP_STRT_DTM)}, '%Y-%m-%d %H:%i:%s')
          , DATE_FORMAT(${dbc.escape(data.STEP_END_DTM)}, '%Y-%m-%d %H:%i:%s')
          , ${dbc.escape(data.STEP_CNTNTS)}
          , DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
          , ${dbc.escape(data.userData.seq)}
          , 1
        )
        `
        logger.info("addStepQuery", {message: query})
        return query
    },
    
    // 프로젝트 - 단계 조회
    getStep : function (data) {
        return `
        SELECT
            S.STEP_SEQ          AS STEP_SEQ
          , S.STEP_NM           AS STEP_NM
          , S.STEP_STRT_DTM     AS STEP_STRT_DTM
          , S.STEP_END_DTM      AS STEP_END_DTM
          , S.STEP_CNTNTS       AS STEP_CNTNTS
          , S.STEP_REG_DTM      AS STEP_REG_DTM
          , IFNULL(S.STEP_MOD_DTM, S.STEP_REG_DTM)      AS STEP_MOD_DTM     -- NULL이면 등록일자 주기
          , MB.MBR_NM           AS WRTR
         FROM STEP S
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = S.STEP_REG_MBR_SEQ
        WHERE 1 = 1
          AND S.STEP_USE_TF = 1
          AND S.STEP_PRJ_SEQ = '${data.schdSeq}'
        ORDER BY S.STEP_SEQ
        `
    },
    
    // 프로젝트 - 단계 수정
    chgStep : function(data) {
        return `
        UPDATE STEP
           SET STEP_NM = ${dbc.escape(data.STEP_NM)}
             , STEP_STRT_DTM = DATE_FORMAT(${dbc.escape(data.STEP_STRT_DTM)}, '%Y-%m-%d %H:%i:%s')
             , STEP_END_DTM = DATE_FORMAT(${dbc.escape(data.STEP_END_DTM)}, '%Y-%m-%d %H:%i:%s')
             , STEP_CNTNTS = ${dbc.escape(data.STEP_CNTNTS)}
             , STEP_MOD_DTM = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
             , STEP_MOD_MBR_SEQ = ${dbc.escape(data.userData.seq)}
        WHERE 1 = 1
          AND STEP_PRJ_SEQ = ${dbc.escape(data.SCHD_SEQ)}
        `
    },

    delStep : function(data) {
        return `
        DELETE FROM STEP
        WHERE 1 = 1
          AND STEP_PRJ_SEQ = ${dbc.escape(data.SCHD_SEQ)}
        `
    },

    clsStep : function (data) { // 상위 프로젝트 삭제로 인한 단계 논리적 삭제
        return `
        UPDATE STEP
           SET STEP_USE_TF = 0
             , STEP_MOD_DTM = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
             , STEP_MOD_MBR_SEQ = ${dbc.escape(data.userData.seq)}
         WHERE 1 = 1
           AND STEP_PRJ_SEQ = ${dbc.escape(data.SCHD_SEQ)}
        `
    }
}


module.exports = stepQuery