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
    // 스케줄 (진행중+미도래)
    getSchds : function(data) {
        return `
        SELECT 
          ROW_NUMBER() OVER() AS SCHD_ALL_SEQ,
          SCHD_TP,
          SCHD_SEQ,
          SCHD_NO,
          SCHD_PIN_YN,
          SCHD_PRTC,
          SCHD_PRGSS_CD,
          SCHD_DDLN_OVR,
          SCHD_PRGSS_PRCNT,
          SCHD_STRT_DTM,
          SCHD_END_DTM,
          SCHD_TOT_TIME,
          SCHD_CNTNTS,
          SCHD_WBS_LINK,
          SCHD_REG_DTM,
          SCHD_MOD_DTM,
          SCHD_WRTR
        FROM (
          SELECT
              '0'                          AS SCHD_TP
            , M.MTNG_SEQ                   AS SCHD_SEQ
            , M.MTNG_NO                    AS SCHD_NO
            , M.MTNG_PIN_YN                AS SCHD_PIN_YN                     -- 상단 고정 여부
            , M.MTNG_PRTC                  AS SCHD_PRTC                       -- 참가자
            , CASE WHEN M.MTNG_STRT_DTM > NOW() THEN '미도래'
                  ELSE CM.CM_ITM_NM
              END                          AS SCHD_PRGSS_CD                   -- 진행 상태
            , CASE WHEN M.MTNG_END_DTM > NOW() THEN 0                         -- 기한에 따른 상태 체크 ( 진행 중 + 기한이 지난 것에 대한 표시 필요 )
                  ELSE 1
              END                          AS SCHD_DDLN_OVR                   --          0 : 정상, 1: 미완료+기한 지남
            , ''                           AS SCHD_PRGSS_PRCNT                -- 진척도
            , DATE_FORMAT(M.MTNG_STRT_DTM, '%y년 %m월 %d일 %H시 %i분')    AS SCHD_STRT_DTM    -- (기간) 시작시간
            , DATE_FORMAT(M.MTNG_END_DTM, '%y년 %m월 %d일 %H시 %i분')     AS SCHD_END_DTM    -- (기간) 종료시간
            , M.MTNG_TOT_TIME              AS SCHD_TOT_TIME                   -- 총 시간(기간)
            , M.MTNG_CNTNTS                AS SCHD_CNTNTS                     -- 내용
            , ''                           AS SCHD_WBS_LINK                   -- 프로젝트 WBS 링크
            , DATE_FORMAT(M.MTNG_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
            , DATE_FORMAT(IFNULL(M.MTNG_MOD_DTM, M.MTNG_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
            , MB.MBR_NM                                      AS SCHD_WRTR
          FROM MTNG M
          INNER JOIN MBR MB
            ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
            AND MBR_USE_TF = 1
            AND MBR_ROLE = 'USER'
          INNER JOIN CM_CD_ITM CM
            ON CM.CM_GRP_CD = '4'
          WHERE 1 = 1
            AND CM.CM_ITM_CD = M.MTNG_PRGSS_CD
  --        AND MB.MBR_NM = '${data.mbrNm}'
            AND M.MTNG_USE_TF = 1
            AND M.MTNG_PRGSS_CD = 1                           -- 진행중인 것만 (완료, 취소 제외)
  --           AND M.MTNG_END_DTM > NOW()
          UNION ALL
          SELECT
              '1'                         AS SCHD_TP
            , P.PRJ_SEQ                   AS SCHD_SEQ
            , P.PRJ_NO                    AS SCHD_NO
            , P.PRJ_PIN_YN                AS SCHD_PIN_YN                     -- 상단 고정 여부
            , P.PRJ_PRTC                  AS SCHD_PRTC                       -- 참가자
            , CASE WHEN P.PRJ_STRT_DTM > NOW() THEN '미도래'
                  ELSE CM.CM_ITM_NM 
              END                         AS SCHD_PRGSS_CD                   -- 진행 상태
            , CASE WHEN P.PRJ_END_DTM > NOW() THEN 0                         -- 기한에 따른 상태 체크 ( 진행 중 + 기한이 지난 것에 대한 표시 필요 )
                  ELSE 1
              END                         AS SCHD_DDLN_OVR                   --          0 : 정상, 1: 미완료+기한 지남
            , P.PRJ_PRGSS_PRCNT           AS SCHD_PRGSS_PRCNT                -- 진척도
            , DATE_FORMAT(P.PRJ_STRT_DTM, '%y년 %m월 %d일')   AS SCHD_STRT_DTM    -- (기간) 시작시간
            , DATE_FORMAT(P.PRJ_END_DTM, '%y년 %m월 %d일')    AS SCHD_END_DTM     -- (기간) 종료시간
            , P.PRJ_TOT_TIME              AS SCHD_TOT_TIME                   -- 총 시간(기간)
            , P.PRJ_CNTNTS                AS SCHD_CNTNTS                     -- 내용
            , IFNULL(P.PRJ_WBS_LINK, '')                     AS SCHD_WBS_LINK    -- 프로젝트 WBS 링크
            , DATE_FORMAT(P.PRJ_REG_DTM, '%Y-%m-%d %H:%i')   AS SCHD_REG_DTM     -- 등록 일자
            , DATE_FORMAT(IFNULL(P.PRJ_MOD_DTM, P.PRJ_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
            , MB.MBR_NM                                      AS SCHD_WRTR
          FROM PRJ P
          INNER JOIN MBR MB
            ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
            AND MBR_USE_TF = 1
            AND MBR_ROLE = 'USER'
          INNER JOIN CM_CD_ITM CM
            ON CM.CM_GRP_CD = '4'
          WHERE 1 = 1
            AND CM.CM_ITM_CD = P.PRJ_PRGSS_CD
  --        AND MB.MBR_NM = '${data.mbrNm}'
            AND P.PRJ_USE_TF = 1
            AND P.PRJ_PRGSS_CD = 1                           -- 진행중인 것만 (완료, 취소 제외)
  --           AND P.PRJ_END_DTM > NOW()
        ) AS schd
        ORDER BY SCHD_PIN_YN DESC, SCHD_STRT_DTM DESC, SCHD_REG_DTM DESC
        `
    },
    // 최근 3개월 스케줄 ( 완료이거나, 종료일자가 오늘을 넘긴 것 )
    getSchdsByMonth : function(data) {
        return `
        SELECT 
          ROW_NUMBER() OVER() AS SCHD_ALL_SEQ,
          SCHD_TP,
          SCHD_SEQ,
          SCHD_NO,
      --  SCHD_PIN_YN,        -- 완료게시물 상단고정 안함
          SCHD_PRTC,
          SCHD_PRGSS_CD,
          SCHD_PRGSS_PRCNT,
          SCHD_STRT_DTM,
          SCHD_END_DTM,
          SCHD_TOT_TIME,
          SCHD_CNTNTS,
          SCHD_WBS_LINK,
          SCHD_REG_DTM,
          SCHD_MOD_DTM,
          SCHD_WRTR
        FROM (
          SELECT
              '0'                          AS SCHD_TP
            , M.MTNG_SEQ                   AS SCHD_SEQ
            , M.MTNG_NO                    AS SCHD_NO
            , M.MTNG_PIN_YN                AS SCHD_PIN_YN                     -- 상단 고정 여부
            , M.MTNG_PRTC                  AS SCHD_PRTC                       -- 참가자
            , CM.CM_ITM_NM                 AS SCHD_PRGSS_CD                   -- 진행 상태
            , ''                           AS SCHD_PRGSS_PRCNT                -- 진척도
            , DATE_FORMAT(M.MTNG_STRT_DTM, '%y년 %m월 %d일 %H시 %i분')    AS SCHD_STRT_DTM    -- (기간) 시작시간
            , DATE_FORMAT(M.MTNG_END_DTM, '%y년 %m월 %d일 %H시 %i분')     AS SCHD_END_DTM    -- (기간) 종료시간
            , M.MTNG_TOT_TIME              AS SCHD_TOT_TIME                   -- 총 시간(기간)
            , M.MTNG_CNTNTS                AS SCHD_CNTNTS                     -- 내용
            , ''                           AS SCHD_WBS_LINK                   -- 프로젝트 WBS 링크
            , DATE_FORMAT(M.MTNG_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
            , DATE_FORMAT(IFNULL(M.MTNG_MOD_DTM, M.MTNG_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
            , MB.MBR_NM                    AS SCHD_WRTR
          FROM MTNG M
          INNER JOIN MBR MB
            ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
            AND MBR_USE_TF = 1
            AND MBR_ROLE = 'USER'
          INNER JOIN CM_CD_ITM CM
            ON CM.CM_GRP_CD = '4'
          WHERE 1 = 1
            AND CM.CM_ITM_CD = M.MTNG_PRGSS_CD
    --      AND MB.MBR_NM = '${data.mbrNm}'
            AND M.MTNG_USE_TF = 1
            AND M.MTNG_PRGSS_CD != 1                                                            -- 진행중이 아니면서 (완료OR취소)
            AND (M.MTNG_END_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW()          -- 기간이 3개월 전 ~ 현재 사이에 있는 경우(3개월 전 스케줄이면서, 시작일자/종료일자가 지금보다 과거일때)
                OR
                M.MTNG_STRT_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW())
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
            , IFNULL(P.PRJ_WBS_LINK, '')                    AS SCHD_WBS_LINK -- 프로젝트 WBS 링크
            , DATE_FORMAT(P.PRJ_REG_DTM, '%Y-%m-%d %H:%i')  AS SCHD_REG_DTM  -- 등록 일자
            , DATE_FORMAT(IFNULL(P.PRJ_MOD_DTM, P.PRJ_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
            , MB.MBR_NM                                      AS SCHD_WRTR
          FROM PRJ P
          INNER JOIN MBR MB
            ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
            AND MBR_USE_TF = 1
            AND MBR_ROLE = 'USER'
          INNER JOIN CM_CD_ITM CM
            ON CM.CM_GRP_CD = '4'
          WHERE 1 = 1
            AND CM.CM_ITM_CD = P.PRJ_PRGSS_CD
    --      AND MB.MBR_NM = '${data.mbrNm}'
            AND P.PRJ_USE_TF = 1
            AND P.PRJ_PRGSS_CD != 1                                                             -- 진행중이 아니면서 (완료OR취소)
            AND (P.PRJ_END_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW()           -- 기간이 3개월 전 ~ 현재 사이에 있는 경우(3개월 전 스케줄이면서, 시작일자/종료일자가 지금보다 과거일때)
                OR
                P.PRJ_STRT_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW())
        ) AS schd
        ORDER BY SCHD_END_DTM DESC, SCHD_REG_DTM DESC
        `
    },

    // 개인 스케줄 - 왼쪽 카운트
    getSchdsCount : function(data) {
        return `
        SELECT 
            COUNT(CASE WHEN A.SCHD_PRGSS_CD = 1
                       THEN 1
                  END)          AS ACTING
            , COUNT(CASE WHEN A.SCHD_PRGSS_CD != 1 AND A.SCHD_END_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND NOW()
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
                  AND M.MTNG_USE_TF = 1
                UNION ALL
                SELECT P.PRJ_PRGSS_CD AS SCHD_PRGSS_CD
                     , P.PRJ_END_DTM  AS SCHD_END_DTM
                FROM PRJ P
                INNER JOIN MBR MB
                   ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
                WHERE 1 = 1
                  AND MB.MBR_NM = '${data.mbrNm}'
                  AND P.PRJ_USE_TF = 1
        ) A
        `
    },

    getAllSchd : function (data) {
        return `
        SELECT
            M.MTNG_REG_MBR_SEQ                        AS REG_MBR_SEQ
          , '0'                                       AS SCHD_TP
          , M.MTNG_SEQ                                AS SCHD_SEQ
          , M.MTNG_NO                                 AS SCHD_NO
          , M.MTNG_PIN_YN                             AS SCHD_PIN_YN
          , M.MTNG_PRTC                               AS SCHD_PRTC        -- 참여자
          , CM.CM_ITM_NM                              AS SCHD_PRGSS_CD    -- 스케줄 상태
          , ''                                        AS SCHD_PRGSS_PRCNT -- 진척도
          , DATE_FORMAT(M.MTNG_STRT_DTM, '%y년 %m월 %d일 %H시 %i분')                       AS SCHD_STRT_DTM
          , DATE_FORMAT(M.MTNG_END_DTM, '%y년 %m월 %d일 %H시 %i분')                        AS SCHD_END_DTM
          , M.MTNG_CNTNTS                             AS SCHD_CNTNTS
          , ''                                        AS SCHD_WBS_LINK                   -- 프로젝트 WBS 링크
          , DATE_FORMAT(IFNULL(M.MTNG_MOD_DTM, M.MTNG_REG_DTM), '%Y-%m-%d %H:%i')        AS SCHD_MOD_DTM
          , MB.MBR_NM
         FROM MTNG M
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
          AND CM.CM_ITM_CD = M.MTNG_PRGSS_CD
        WHERE 1 = 1
          AND MTNG_USE_TF = 1
      --  AND MTNG_PRGSS_CD = 1
      --  AND MTNG_END_DTM > NOW()
        UNION ALL
        SELECT
            P.PRJ_REG_MBR_SEQ                         AS REG_MBR_SEQ
          , '1'                                       AS SCHD_TP
          , P.PRJ_SEQ                                 AS SCHD_SEQ
          , P.PRJ_NO                                  AS SCHD_NO
          , P.PRJ_PIN_YN                              AS SCHD_PIN_YN
          , P.PRJ_PRTC                                AS SCHD_PRTC    -- 참여자
          , CM.CM_ITM_NM                              AS SCHD_PRGSS_CD    -- 스케줄 상태
          , P.PRJ_PRGSS_PRCNT                         AS SCHD_PRGSS_PRCNT -- 진척도
          , DATE_FORMAT(P.PRJ_STRT_DTM, '%y년 %m월 %d일')                               AS SCHD_STRT_DTM
          , DATE_FORMAT(P.PRJ_END_DTM, '%y년 %m월 %d일')                                AS SCHD_END_DTM
          , P.PRJ_CNTNTS                              AS SCHD_CNTNTS
          , IFNULL(P.PRJ_WBS_LINK, '')                AS SCHD_WBS_LINK                   -- 프로젝트 WBS 링크
          , DATE_FORMAT(IFNULL(P.PRJ_MOD_DTM, P.PRJ_REG_DTM), '%Y-%m-%d %H:%i')        AS SCHD_MOD_DTM
          , MB.MBR_NM
         FROM PRJ P
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
          AND CM.CM_ITM_CD = P.PRJ_PRGSS_CD
        WHERE 1 = 1
          AND PRJ_USE_TF = 1
      --  AND PRJ_PRGSS_CD = 1
      --  AND PRJ_END_DTM > NOW()
        ORDER BY SCHD_STRT_DTM ASC
        `
    },
    // 스케줄 기간별 조회
    getAllSchdByMonth : function(data) {
      return `
      SELECT
        REG_MBR_SEQ,
        SCHD_TP,
        SCHD_SEQ,
        SCHD_NO,
        SCHD_PIN_YN,
        SCHD_PRTC,
        SCHD_PRGSS_CD,
        SCHD_PRGSS_PRCNT,
        SCHD_STRT_DTM,
        SCHD_END_DTM,
        SCHD_CNTNTS,
        SCHD_WBS_LINK,
        SCHD_MOD_DTM,
        MBR_NM
      FROM (
        SELECT
            M.MTNG_REG_MBR_SEQ AS REG_MBR_SEQ,
            '0' AS SCHD_TP,
            M.MTNG_SEQ AS SCHD_SEQ,
            M.MTNG_NO AS SCHD_NO,
            M.MTNG_PIN_YN AS SCHD_PIN_YN,
            M.MTNG_PRTC AS SCHD_PRTC,
            CM.CM_ITM_NM AS SCHD_PRGSS_CD,
            '' AS SCHD_PRGSS_PRCNT,
            DATE_FORMAT(M.MTNG_STRT_DTM, '%y년 %m월 %d일 %H시 %i분') AS SCHD_STRT_DTM,
            DATE_FORMAT(M.MTNG_END_DTM, '%y년 %m월 %d일 %H시 %i분') AS SCHD_END_DTM,
            M.MTNG_CNTNTS AS SCHD_CNTNTS,
            '' AS SCHD_WBS_LINK,
            DATE_FORMAT(IFNULL(M.MTNG_MOD_DTM, M.MTNG_REG_DTM), '%Y-%m-%d %H:%i') AS SCHD_MOD_DTM,
            MB.MBR_NM
        FROM MTNG M
        INNER JOIN MBR MB 
          ON MB.MBR_SEQ = M.MTNG_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM 
          ON CM.CM_GRP_CD = '4'
          AND CM.CM_ITM_CD = M.MTNG_PRGSS_CD
        WHERE 1 = 1
            AND MTNG_USE_TF = 1
            AND DATE_FORMAT(MTNG_STRT_DTM, '%Y-%m-%d') BETWEEN '${data.fromDate}' AND '${data.toDate}'     -- 시작일이 기간에 걸려있을 때
                -- OR DATE_FORMAT(MTNG_END_DTM, '%Y-%m-%d') BETWEEN '${data.fromDate}' AND '${data.toDate}'   -- 미팅은 시작일=종료일이라 두번 쓰는게 필요없당..
        UNION ALL
        SELECT
            P.PRJ_REG_MBR_SEQ AS REG_MBR_SEQ,
            '1' AS SCHD_TP,
            P.PRJ_SEQ AS SCHD_SEQ,
            P.PRJ_NO AS SCHD_NO,
            P.PRJ_PIN_YN AS SCHD_PIN_YN,
            P.PRJ_PRTC AS SCHD_PRTC,
            CM.CM_ITM_NM AS SCHD_PRGSS_CD,
            P.PRJ_PRGSS_PRCNT AS SCHD_PRGSS_PRCNT,
            DATE_FORMAT(P.PRJ_STRT_DTM, '%y년 %m월 %d일') AS SCHD_STRT_DTM,
            DATE_FORMAT(P.PRJ_END_DTM, '%y년 %m월 %d일') AS SCHD_END_DTM,
            P.PRJ_CNTNTS AS SCHD_CNTNTS,
            IFNULL(P.PRJ_WBS_LINK, '') AS SCHD_WBS_LINK,
            DATE_FORMAT(IFNULL(P.PRJ_MOD_DTM, P.PRJ_REG_DTM), '%Y-%m-%d %H:%i') AS SCHD_MOD_DTM,
            MB.MBR_NM
        FROM PRJ P
        INNER JOIN MBR MB 
          ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM 
          ON CM.CM_GRP_CD = '4' 
          AND CM.CM_ITM_CD = P.PRJ_PRGSS_CD
        WHERE 1 = 1
            AND PRJ_USE_TF = 1
            AND (DATE_FORMAT(PRJ_STRT_DTM, '%Y-%m-%d') <= '${data.toDate}'
                AND DATE_FORMAT(PRJ_END_DTM, '%Y-%m-%d') >= '${data.fromDate}' )    -- 검색 시작,종료일에 걸쳐있는 진행중인 프로젝트 모두 나오게 조건 수정
      ) AS schd
      ORDER BY SCHD_STRT_DTM ASC;
      `
    }
};

module.exports = scheduleQuery