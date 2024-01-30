const dbc = require("../dbconn.js");
const logger = require("../logger.js");

const query = {
  // // //프로젝트들 조회
  // // getProjects: function (data) {
  // //   const query = `
  // //   SELECT
  // //       prj.PRJ_SEQ,
  // //       prj.PRJ_NO,
  // //       prj.PRJ_CNTNTS,
  // //       prj.PRJ_PRGSS_CD,
  // //       prj.PRJ_PRGSS_PRCNT,
  // //       prj.PRJ_IN_CHRG,
  // //       DATE_FORMAT(prj.PRJ_REG_DTM, '%Y-%m-%d %H:%i:%s') AS PRJ_REG_DTM
  // //   FROM PRJ prj
  // //   WHERE prj.PRJ_PRGSS_CD IN (1,2)
  // //   AND prj.PRJ_USE_TF = true;
  // //   `;
  // //   logger.info("getProjects",{message:query});
  // //   return query;
  // // },
  // // //프로젝트 상세 조회
  // // getProjectDetail: function (data) {
  // //   const query = `
  // //   SELECT
  // //       prj.PRJ_CNTNTS,
  // //       prj.PRJ_PRGSS_CD,
  // //       prj.PRJ_PRGSS_PRCNT,
  // //       prj.PRJ_IN_CHRG,
  // //       mbr.MBR_NM,             -- 등록자
  // //   FROM PRJ prj
  // //   INNER JOIN MBR mbr
  // //       ON mbr.MBR_SEQ = prj.PRJ_REG_MBR_SEQ
  // //   WHERE prj.PRJ_SEQ = ${data.prjSeq}
  // //   `
  // //   logger.info("getProjectDetail",{message:query});
  // //   return query;
  // // },
  // // //프로젝트 등록
  // // postProjects: function (data) {
  // //   const query = `INSERT INTO PRJ(
  // //       PRJ_NO,
  // //       PRJ_CNTNTS,
  // //       PRJ_PRGSS_CD,
  // //       PRJ_PRGSS_PRCNT,
  // //       PRJ_IN_CHRG,
  // //       PRJ_REG_DTM,
  // //       PRJ_REG_MBR_SEQ,
  // //       PRJ_USE_TF
  // //   ) VALUES(
  // //       (SELECT COUNT(0) + 1 FROM
  // //       PRJ prj2
  // //       WHERE
  // //       prj2.PRJ_REG_DTM >= DATE_FORMAT(now(), '%Y-%m-01')),
  // //       ${data.contents},
  // //       '1', -- 진행중
  // //       '0',
  // //       ${data.inCharge},
  // //       now(),
  // //       ${data.userData.seq},
  // //       TRUE)`;
  // //   logger.info(query);
  // //   return query;
  // // },
  // // //프로젝트 상세 변경
  // // patchProject: function(data){
  // //   const query = `
  // //   UPDATE PRJ SET
  // //       PRJ_CNTNTS,         -- 프로젝트내용
  // //       PRJ_IN_CHRG,        -- 프로젝트담당자
  // //       PRJ_PRGSS_CD,       -- 프로젝트 진행상태
  // //       PRJ_PRGSS_PRCNT,    -- 프로젝트 진행도 퍼센테이지
  // //       PRJ_MOD_DTM,
  // //   WHERE PRJ_SEQ = ${data.prjSeq}`
  // //   logger.info("patchProjects",{message:query})
  // //   return query
  // // },
  // // //프로젝트 논리적 삭제
  // // deleteProject:function(data){
  // //   const query = `
  // //   UPDATE PRJ SET
  // //       PRJ_USE_TF = false
  // //   WHERE PRJ_SEQ =${data.prjSeq}`
  // //   logger.info("deleteProject",{message:query})
  // //   return query
  // // },
  // // //종료된 프로젝트 확인
  // // getProjectsFin: function(data){
  // //   const query = `
  // //   SELECT
  // //       prj.PRJ_SEQ,
  // //       prj.PRJ_NO,
  // //       prj.PRJ_CNTNTS,
  // //       prj.PRJ_PRGSS_CD,
  // //       prj.PRJ_PRGSS_PRCNT,
  // //       prj.PRJ_IN_CHRG,
  // //       DATE_FORMAT(prj.PRJ_REG_DTM, '%Y-%m-%d %H:%i:%s') AS PRJ_REG_DTM
  // //   FROM PRJ prj
  // //   WHERE 1=1
  // //       AND prj.PRJ_PRGSS_CD = 0
  // //       AND prj.PRJ_REG_DTM >= '${data.fromDate}'
  // //       AND DATE_FORMAT(prj.PRJ_REG_DTM, '%Y-%m-%d') <= '${data.toDate}'
  // //       AND prj.PRJ_USE_TF = true;`
  // //   logger.info("getProjectsFin",{message:query})
  // //   return query
  // }
  // ---------------- 기존 프로젝트 쿼리 ( 컬럼 타입 수정 및 추가로 인해 쿼리 새로 작성 ) ----------------------  //

    getPrj : function(data) {
        return `
        SELECT 
            P.PRJ_SEQ                               AS SCHD_SEQ
          , '1'                                     AS SCHD_TP  -- 0: 미팅, 1: 프로젝트
          , P.PRJ_NO                                AS SCHD_NO  -- 개인 스케줄 번호 넘버링 값
          , P.PRJ_PIN_YN                            AS SCHD_PIN_YN  -- 상단 고정 여부
          , P.PRJ_PRTC                              AS SCHD_PRTC    -- 참여자
          , CM.CM_ITM_NM                            AS SCHD_PRGSS_CD    -- 스케줄 상태
          , P.PRJ_PRGSS_PRCNT                       AS SCHD_PRGSS_PRCNT -- 진척도
          , DATE_FORMAT(P.PRJ_STRT_DTM, '%y년 %m월 %d일')  AS SCHD_STRT_DTM -- 기간 FROM
          , DATE_FORMAT(P.PRJ_END_DTM, '%y년 %m월 %d일')   AS SCHD_END_DTM  -- 기간 TO
          , P.PRJ_TOT_TIME                          AS SCHD_TOT_TIME -- 총 소요 시간
          , P.PRJ_CNTNTS                            AS SCHD_CNTNTS  -- 스케줄 내용
          , DATE_FORMAT(P.PRJ_REG_DTM, '%Y-%m-%d %H:%i')           AS SCHD_REG_DTM  -- 등록 일자
          , DATE_FORMAT(IFNULL(P.PRJ_MOD_DTM, P.PRJ_REG_DTM), '%Y-%m-%d %H:%i')  AS SCHD_MOD_DTM
          , MB.MBR_NM                               AS SCHD_WRTR    -- 작성자(등록자)
        FROM PRJ P
        INNER JOIN MBR MB
           ON MB.MBR_SEQ = P.PRJ_REG_MBR_SEQ
        INNER JOIN CM_CD_ITM CM
           ON CM.CM_GRP_CD = '4'
        WHERE 1 = 1
          AND CM.CM_ITM_CD = P.PRJ_PRGSS_CD
          AND MB.MBR_NM = '${data.mbrNm}'
          AND P.PRJ_USE_TF = 1
          AND P.PRJ_SEQ = '${data.schdSeq}'
        `
    },

    addPrj : function(data) {
        const query = `
        INSERT INTO PRJ ( PRJ_NO
                        , PRJ_PIN_YN
                        , PRJ_PRTC
                        , PRJ_PRGSS_CD
                        , PRJ_PRGSS_PRCNT
                        , PRJ_STRT_DTM
                        , PRJ_END_DTM
                        , PRJ_TOT_TIME
                        , PRJ_CNTNTS
                        , PRJ_REG_DTM
                        , PRJ_REG_MBR_SEQ
                        , PRJ_USE_TF
        ) VALUES ( (SELECT IFNULL(MAX(SCHD_NO), 0) + 1 AS PRJ_NO
                    FROM (SELECT '0'        AS SCHD_TP
                               , MTNG_SEQ   AS SCHD_SEQ
                               , MTNG_NO          AS SCHD_NO
                               , MTNG_REG_MBR_SEQ AS SCHD_REG_MBR_SEQ
                          FROM MTNG
                          WHERE MTNG_REG_MBR_SEQ = ${dbc.escape(data.userData.seq)}
                          UNION ALL
                          SELECT '1'             AS SCHD_TP
                               , PRJ_SEQ         AS SCHD_SEQ
                               , PRJ_NO          AS SCHD_NO
                               , PRJ_REG_MBR_SEQ AS SCHD_REG_MBR_SEQ
                          FROM PRJ
                          WHERE PRJ_REG_MBR_SEQ = ${dbc.escape(data.userData.seq)}
                          ) A)
                  , ${dbc.escape(data.SCHD_PIN_YN)}
                  , ${dbc.escape(data.SCHD_PRTC)}
                  , ${dbc.escape(data.SCHD_PRGSS_CD)}
                  , ${dbc.escape(data.SCHD_PRGSS_PRCNT)}
                  , DATE_FORMAT(CONCAT(${dbc.escape(data.SCHD_STRT_DTM)},' 00:00:00'), '%Y-%m-%d %H:%i:%s')
                  , DATE_FORMAT(CONCAT(${dbc.escape(data.SCHD_END_DTM)}, ' 23:59:59'), '%Y-%m-%d %H:%i:%s')
                  , DATEDIFF(DATE_FORMAT(CONCAT(${dbc.escape(data.SCHD_END_DTM)}, ' 23:59:59'), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(CONCAT(${dbc.escape(data.SCHD_STRT_DTM)},' 00:00:00'), '%Y-%m-%d %H:%i:%s'))+1
                  , ${dbc.escape(data.SCHD_CNTNTS)}
                  , DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
                  , ${dbc.escape(data.userData.seq)}
                  , 1
        )
        `
        logger.info("addPrjQuery", {message: query})
        return query
    },

    chgPrj : function (data) {
        return `
            UPDATE PRJ
            SET PRJ_PIN_YN      = ${dbc.escape(data.SCHD_PIN_YN)}
              , PRJ_PRTC        = ${dbc.escape(data.SCHD_PRTC)}
              , PRJ_PRGSS_CD    = ${dbc.escape(data.SCHD_PRGSS_CD)}
              , PRJ_PRGSS_PRCNT = ${dbc.escape(data.SCHD_PRGSS_PRCNT)}
              , PRJ_STRT_DTM    = DATE_FORMAT(CONCAT(${dbc.escape(data.SCHD_STRT_DTM)}, ' 00:00:00'), '%Y-%m-%d %H:%i:%s')
              , PRJ_END_DTM     = DATE_FORMAT(CONCAT(${dbc.escape(data.SCHD_END_DTM)}, ' 23:59:59'), '%Y-%m-%d %H:%i:%s')
              , PRJ_TOT_TIME    = DATEDIFF(DATE_FORMAT(${dbc.escape(data.SCHD_END_DTM)}, '%Y-%m-%d %H:%i:%s'),
                                           DATE_FORMAT(${dbc.escape(data.SCHD_STRT_DTM)}, '%Y-%m-%d %H:%i:%s')) + 1
              , PRJ_CNTNTS      = ${dbc.escape(data.SCHD_CNTNTS)}
              , PRJ_MOD_DTM     = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
              , PRJ_MOD_MBR_SEQ = ${dbc.escape(data.userData.seq)}
            WHERE 1 = 1
              AND PRJ_SEQ = ${dbc.escape(data.SCHD_SEQ)}
        `
    },

    clsPrj : function (data) {
        return `
        UPDATE PRJ
           SET PRJ_USE_TF = 0
             , PRJ_MOD_DTM = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
             , PRJ_MOD_MBR_SEQ = ${dbc.escape(data.userData.seq)}
         WHERE 1 = 1
           AND PRJ_SEQ = ${dbc.escape(data.SCHD_SEQ)}
        `
    }
};

module.exports = query;
