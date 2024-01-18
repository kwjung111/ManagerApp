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
        INSERT INTO SCHD(
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

    },
    // 개인 스케줄 (진행중+미도래)
    getSchds : function(data) {
        return `
        SELECT
            '0'                          AS SCHD_TP
          , M.MTNG_SEQ                   AS SCHD_SEQ
          , M.MTNG_NO                    AS SCHD_NO
          , M.MTNG_PIN_YN                AS SCHD_PIN_YN                     -- 상단 고정 여부
          , M.MTNG_PRTC                  AS SCHD_PRTC                       -- 참가자
          , CM.CM_ITM_NM                 AS SCHD_PRGSS_CD                   -- 진행 상태
          , ''                           AS SCHD_PRGSS_PRCNT                -- 진척도
          , DATE_FORMAT(M.MTNG_STRT_DTM, '%y년 %m월 %d일 %H시 %i분')   AS SCHD_STRT_DTM    -- (기간) 시작시간
          , DATE_FORMAT(M.MTNG_END_DTM, '%H시 %i분')     AS SCHD_END_DTM    -- (기간) 종료시간
          , M.MTNG_TOT_TIME              AS SCHD_TOT_TIME                   -- 총 시간(기간)
          , M.MTNG_CNTNTS                AS SCHD_CNTNTS                     -- 내용
          , DATE_FORMAT(M.MTNG_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
          , DATE_FORMAT(IFNULL(M.MTNG_MOD_DTM, M.MTNG_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
          , MB.MBR_NM                                      AS SCHD_WRTR
        FROM MTNG M
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
        WHERE 1 = 1
          AND CM.CM_ITM_CD = M.MTNG_PRGSS_CD
          AND MB.MBR_NM = '${data.mbrNm}'
          AND M.MTNG_USE_TF = 1
          AND M.MTNG_PRGSS_CD != '2'
          AND M.MTNG_END_DTM > NOW()
        UNION ALL
        SELECT
            '1'                         AS SCHD_TP
          , P.PRJ_SEQ                   AS SCHD_SEQ
          , P.PRJ_NO                    AS SCHD_NO
          , P.PRJ_PIN_YN                AS SCHD_PIN_YN                     -- 상단 고정 여부
          , P.PRJ_PRTC                  AS SCHD_PRTC                       -- 참가자
          , CM.CM_ITM_NM                 AS SCHD_PRGSS_CD                   -- 진행 상태
          , P.PRJ_PRGSS_PRCNT            AS SCHD_PRGSS_PRCNT                -- 진척도
          , DATE_FORMAT(P.PRJ_STRT_DTM, '%y년 %m월 %d일')   AS SCHD_STRT_DTM    -- (기간) 시작시간
          , DATE_FORMAT(P.PRJ_END_DTM, '%y년 %m월 %d일')     AS SCHD_END_DTM    -- (기간) 종료시간
          , P.PRJ_TOT_TIME              AS SCHD_TOT_TIME                   -- 총 시간(기간)
          , P.PRJ_CNTNTS                AS SCHD_CNTNTS                     -- 내용
          , DATE_FORMAT(P.PRJ_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
          , DATE_FORMAT(IFNULL(P.PRJ_MOD_DTM, P.PRJ_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
          , MB.MBR_NM                                      AS SCHD_WRTR
        FROM PRJ P
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
        WHERE 1 = 1
          AND CM.CM_ITM_CD = P.PRJ_PRGSS_CD
          AND MB.MBR_NM = '${data.mbrNm}'
          AND P.PRJ_USE_TF = 1
          AND P.PRJ_PRGSS_CD != '2'
          AND P.PRJ_END_DTM > NOW()
        ORDER BY SCHD_PIN_YN DESC, SCHD_STRT_DTM DESC, SCHD_REG_DTM DESC
        `
    },

    getSchdsByMonth : function(data) {
        return `
        SELECT
            '0'                          AS SCHD_TP
          , M.MTNG_SEQ                   AS SCHD_SEQ
          , M.MTNG_NO                    AS SCHD_NO
          , M.MTNG_PIN_YN                AS SCHD_PIN_YN                     -- 상단 고정 여부
          , M.MTNG_PRTC                  AS SCHD_PRTC                       -- 참가자
          , CM.CM_ITM_NM                 AS SCHD_PRGSS_CD                   -- 진행 상태
          , ''                           AS SCHD_PRGSS_PRCNT                -- 진척도
          , DATE_FORMAT(M.MTNG_STRT_DTM, '%y년 %m월 %d일 %H시 %i분')   AS SCHD_STRT_DTM    -- (기간) 시작시간
          , DATE_FORMAT(M.MTNG_END_DTM, '%H시 %i분')     AS SCHD_END_DTM    -- (기간) 종료시간
          , M.MTNG_TOT_TIME              AS SCHD_TOT_TIME                   -- 총 시간(기간)
          , M.MTNG_CNTNTS                AS SCHD_CNTNTS                     -- 내용
          , DATE_FORMAT(M.MTNG_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
          , DATE_FORMAT(IFNULL(M.MTNG_MOD_DTM, M.MTNG_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
          , MB.MBR_NM                    AS SCHD_WRTR
        FROM MTNG M
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
        WHERE 1 = 1
          AND CM.CM_ITM_CD = M.MTNG_PRGSS_CD
          AND MB.MBR_NM = '${data.mbrNm}'
          AND M.MTNG_USE_TF = 1
          AND ( M.MTNG_PRGSS_CD = '2'                                                           -- 완료이거나
                OR M.MTNG_END_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW())      -- 종료일자가 3개월 전 ~ 현재 사이에 있는 경우(3개월 전 스케줄이면서, 종료일자가 지금보다 과거일때)
        UNION ALL
        SELECT
            '1'                         AS SCHD_TP
          , P.PRJ_SEQ                   AS SCHD_SEQ
          , P.PRJ_NO                    AS SCHD_NO
          , P.PRJ_PIN_YN                AS SCHD_PIN_YN                     -- 상단 고정 여부
          , P.PRJ_PRTC                  AS SCHD_PRTC                       -- 참가자
          , CM.CM_ITM_NM                AS SCHD_PRGSS_CD                   -- 진행 상태
          , P.PRJ_PRGSS_PRCNT           AS SCHD_PRGSS_PRCNT                -- 진척도
          , DATE_FORMAT(P.PRJ_STRT_DTM, '%y년 %m월 %d일')   AS SCHD_STRT_DTM    -- (기간) 시작시간
          , DATE_FORMAT(P.PRJ_END_DTM, '%y년 %m월 %d일')     AS SCHD_END_DTM    -- (기간) 종료시간
          , P.PRJ_TOT_TIME              AS SCHD_TOT_TIME                   -- 총 시간(기간)
          , P.PRJ_CNTNTS                AS SCHD_CNTNTS                     -- 내용
          , DATE_FORMAT(P.PRJ_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
          , DATE_FORMAT(IFNULL(P.PRJ_MOD_DTM, P.PRJ_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
          , MB.MBR_NM                                      AS SCHD_WRTR
        FROM PRJ P
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
        WHERE 1 = 1
          AND CM.CM_ITM_CD = P.PRJ_PRGSS_CD
          AND MB.MBR_NM = '${data.mbrNm}'
          AND P.PRJ_USE_TF = 1
          AND ( P.PRJ_PRGSS_CD = '2'
                OR P.PRJ_END_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW())
        ORDER BY SCHD_PIN_YN DESC, SCHD_STRT_DTM DESC, SCHD_REG_DTM DESC
        `
    },

    // 개인 스케줄 - 왼쪽 카운트
    getSchdsCount : function(data) {
        return `
        SELECT 
            COUNT(CASE WHEN A.SCHD_PRGSS_CD != '2' AND A.SCHD_END_DTM > NOW()
                       THEN 1
                  END)          AS ACTING
            , COUNT(CASE WHEN A.SCHD_PRGSS_CD = '2' OR A.SCHD_END_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW()
                    THEN 1
                    END)        AS RECENT
        FROM (
                SELECT M.MTNG_PRGSS_CD AS SCHD_PRGSS_CD
                     , M.MTNG_END_DTM  AS SCHD_END_DTM
                FROM MTNG M
                INNER JOIN MBR MB
                   ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
                WHERE 1 = 1
                  AND MB.MBR_NM = '${data.mbrNm}'
                UNION ALL
                SELECT P.PRJ_PRGSS_CD AS SCHD_PRGSS_CD
                     , P.PRJ_END_DTM  AS SCHD_END_DTM
                FROM PRJ P
                INNER JOIN MBR MB
                   ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
                WHERE 1 = 1
                  AND MB.MBR_NM = '${data.mbrNm}'
        ) A
        `
    }
};

module.exports = scheduleQuery