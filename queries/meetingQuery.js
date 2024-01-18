const dbc = require('../dbconn.js')
const logger = require('../logger.js')

const meetingQuery = {
    // 미팅 등록
    addMtng : function(data) {
        const query = `
            INSERT INTO MTNG ( MTNG_NO
                             , MTNG_PIN_YN
                             , MTNG_PRTC
                             , MTNG_PRGSS_CD
                             , MTNG_STRT_DTM
                             , MTNG_END_DTM
                             , MTNG_TOT_TIME
                             , MTNG_CNTNTS
                             , MTNG_REG_DTM
                             , MTNG_REG_MBR_SEQ
                             , MTNG_USE_TF)
            VALUES ( (SELECT COUNT(0) + 1 AS MTNG_NO
                      FROM (SELECT '0'              AS SCHD_TP
                                 , MTNG_SEQ         AS SCHD_SEQ
                                 , MTNG_NO          AS SCHG_NO
                                 , MTNG_REG_MBR_SEQ AS SCHD_REG_MBR_SEQ
                            FROM MTNG
                            WHERE MTNG_REG_MBR_SEQ = ${dbc.escape(data.userData.seq)}
                            UNION ALL
                            SELECT '1'             AS SCHD_TP
                                 , PRJ_SEQ         AS SCHD_SEQ
                                 , PRJ_NO          AS SCHD_NO
                                 , PRJ_REG_MBR_SEQ AS SCHD_REG_MBR_SEQ
                            FROM PRJ
                            WHERE PRJ_REG_MBR_SEQ = ${dbc.escape(data.userData.seq)}) A)
                   , ${dbc.escape(data.SCHD_PIN_YN)}
                   , ${dbc.escape(data.SCHD_PRTC)}
                   , ${dbc.escape(data.SCHD_PRGSS_CD)}
                   , DATE_FORMAT(${dbc.escape(data.SCHD_STRT_DTM)}, '%Y-%m-%d %H:%i:%s')
                   , DATE_FORMAT(${dbc.escape(data.SCHD_END_DTM)}, '%Y-%m-%d %H:%i:%s')
                   , ''
                   , ${dbc.escape(data.SCHD_CNTNTS)}
                   , DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
                   , ${dbc.escape(data.userData.seq)}
                   , 1)
        `
        logger.info("addMeetingQuery", {message: query})
        return query
    },

    // 스케줄(미팅) 상세 조회
    getMtng : function(data) {
        return `
        SELECT 
            M.MTNG_SEQ              AS SCHD_SEQ
          , '0'                     AS SCHD_TP          -- 0: 미팅, 1: 프로젝트
          , M.MTNG_NO               AS SCHD_NO          -- 개인 스케줄 번호 넘버링 값
          , M.MTNG_PIN_YN           AS SCHD_PIN_YN      -- 상단 고정 여부
          , M.MTNG_PRTC             AS SCHD_PRTC        -- 참여자
          , CM.CM_ITM_NM            AS SCHD_PRGSS_CD    -- 스케줄 상태
          , ''                      AS SCHD_PRGSS_PRCNT -- 진척도
          , DATE_FORMAT(M.MTNG_STRT_DTM, '%y년 %m월 %d일 %H시 %i분')   AS SCHD_STRT_DTM -- 기간 FROM
          , DATE_FORMAT(M.MTNG_END_DTM, '%H시 %i분')                  AS SCHD_END_DTM  -- 기간 TO
          , M.MTNG_TOT_TIME         AS SCHD_TOT_TIME    -- 총 소요 시간
          , M.MTNG_CNTNTS           AS SCHD_CNTNTS      -- 스케줄 내용
          , DATE_FORMAT(M.MTNG_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
          , DATE_FORMAT(IFNULL(M.MTNG_MOD_DTM, M.MTNG_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
          , MB.MBR_NM               AS SCHD_WRTR        -- 작성자(등록자)
        FROM MTNG M
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
        WHERE 1 = 1
          AND CM.CM_ITM_CD = M.MTNG_PRGSS_CD
          AND MB.MBR_NM = '${data.mbrNm}'
          AND M.MTNG_USE_TF = 1
          AND M.MTNG_SEQ = '${data.schdSeq}'
        `
    }
}


module.exports = meetingQuery