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
            ${dbc.escape(data.PRJ_SEQ)}
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
    }
}


module.exports = stepQuery