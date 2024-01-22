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