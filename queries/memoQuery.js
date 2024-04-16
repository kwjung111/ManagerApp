const dbc = require('../dbconn.js')
const logger = require('../logger.js')

const memoQuery = {
    //댓글 등록
    addMemo : function(data){
        const query =  `
        INSERT INTO MEMO(
            BRD_SEQ,
            MEMO_CTNTS,
            REG_MBR_SEQ,
            MEMO_REG_DTM,   
            MEMO_USE_TF
            )VALUES(
            ? ,
            ? ,
            ? ,
            NOW(),
            TRUE)`
        return query
    },
    // 자동 등록 - 댓글 등록
    addMemoEncypt : function(data) {
        return `
        INSERT INTO MEMO (
            BRD_SEQ
          , MEMO_CTNTS
          , REG_MBR_SEQ
          , MEMO_REG_DTM
          , MEMO_USE_TF
        ) VALUES (
            ${dbc.escape(data.brdSeq)}
          , ${dbc.escape(data.url)}
          , ${dbc.escape(data.userData.seq)}
          , NOW()
          , TRUE
        )
        `
    },
    //댓글 조회
    getMemos : function(){
        const query =  `
        SELECT 
            memo.MEMO_SEQ,
            mbr.MBR_NM AS WRTR,
            DATE_FORMAT(memo.MEMO_REG_DTM, '%Y-%m-%d %H:%i:%s') AS MEMO_REG_DTM,
            memo.MEMO_CTNTS,
            memo.BRD_SEQ
        FROM MEMO memo
        INNER JOIN BRD brd 
         ON 1=1
         AND brd.BRD_SEQ  = memo.BRD_SEQ 
        AND brd.BRD_USE_TF = TRUE
        AND brd.BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
         INNER JOIN MBR mbr
         on memo.REG_MBR_SEQ  = mbr.MBR_SEQ 
         
        WHERE 1=1 
         AND memo.MEMO_USE_TF  = TRUE
         ORDER BY MEMO_REG_DTM ASC;`
        return query
     },
    //전체 댓글 조회(1주일 제한 없음)
    getMemosAll : function(){
      return `
      SELECT 
          memo.MEMO_SEQ,
          mbr.MBR_NM AS WRTR,
          DATE_FORMAT(memo.MEMO_REG_DTM, '%Y-%m-%d %H:%i:%s') AS MEMO_REG_DTM,
          memo.MEMO_CTNTS,
          memo.BRD_SEQ
      FROM MEMO memo
      INNER JOIN BRD brd 
       ON 1=1
       AND brd.BRD_SEQ  = memo.BRD_SEQ 
      AND brd.BRD_USE_TF = TRUE
       INNER JOIN MBR mbr
       on memo.REG_MBR_SEQ  = mbr.MBR_SEQ 
       
      WHERE 1=1 
       AND memo.MEMO_USE_TF  = TRUE
       ORDER BY MEMO_REG_DTM ASC;`
   },
     //댓글 제거
    deleteMemo : function(){
      const query =  `
        UPDATE MEMO 
        SET MEMO_USE_TF = FALSE
        WHERE 
        MEMO_SEQ = ? `

      return query
    },
    getMemosBySeqs: function(data){
        //escape 사용 없음.
        return `
        SELECT 
        memo.MEMO_SEQ,
        mbr.MBR_NM AS WRTR,
        DATE_FORMAT(memo.MEMO_REG_DTM, '%Y-%m-%d %H:%i:%s') AS MEMO_REG_DTM,
        memo.MEMO_CTNTS,
        memo.BRD_SEQ
        FROM MEMO memo
        INNER JOIN BRD brd 
         ON brd.BRD_SEQ IN ${data.seqs} 
         AND brd.BRD_SEQ  = memo.BRD_SEQ 
         AND brd.BRD_USE_TF = TRUE
        INNER JOIN MBR mbr
         ON mbr.MBR_SEQ = memo.REG_MBR_SEQ
        WHERE 1=1
         AND memo.MEMO_USE_TF = TRUE`
    },

    /**
     * 스케줄 메모 등록/삭제/조회
     * */
    addSchdMemo : function (data) {
        const query = `
        INSERT INTO SCHD_MEMO (
            SCHD_TP
          , SCHD_SEQ
          , SCHD_OWNER_MBR_NM
          , SCHD_MEMO_CNTNTS
          , SCHD_MEMO_REG_DTM
          , SCHD_MEMO_REG_MBR_SEQ
          , SCHD_MEMO_USE_TF
        ) VALUES (
            ${dbc.escape(data.SCHD_TP)}
          , ${dbc.escape(data.SCHD_SEQ)}
          , ${dbc.escape(data.mbrNm)}
          , ${dbc.escape(data.SCHD_MEMO_CNTNTS)}
          , DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
          , ${dbc.escape(data.userData.seq)}
          , 1
        )
        `
        logger.info("addStepQuery", {message: query})
        return query
    },

    clsSchdMemo : function (data) {
        return `
        UPDATE SCHD_MEMO
           SET SCHD_MEMO_USE_TF = 0
             , SCHD_MEMO_DEL_DTM = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')
             , SCHD_MEMO_DEL_MBR_SEQ = ${dbc.escape(data.userData.seq)}
         WHERE 1 = 1
           AND SCHD_MEMO_SEQ = ${dbc.escape(data.SCHD_MEMO_SEQ)}
           AND SCHD_TP = ${dbc.escape(data.SCHD_TP)}
        `
    },
    getSchdMemos : function (data) {
        return `
        SELECT 
            M.SCHD_MEMO_SEQ             AS MEMO_SEQ         -- MEMO KEY
          , M.SCHD_SEQ                  AS SCHD_SEQ         -- 스케줄 SEQ
          , M.SCHD_TP                   AS SCHD_TP          -- 스케줄 TYPE 0: 미팅, 1: 프로젝트
          , MB1.MBR_NM                  AS WRTR
          , DATE_FORMAT(M.SCHD_MEMO_REG_DTM, '%Y-%m-%d %H:%i:%s')   AS MEMO_REG_DTM
          , M.SCHD_MEMO_CNTNTS          AS MEMO_CNTNTS
         FROM SCHD_MEMO M
        INNER JOIN MBR MB1
           ON MB1.MBR_SEQ = M.SCHD_MEMO_REG_MBR_SEQ
        INNER JOIN MBR MB2
           ON MB2.MBR_NM = M.SCHD_OWNER_MBR_NM
        WHERE 1 = 1
          AND M.SCHD_MEMO_USE_TF = 1
          AND MB2.MBR_NM = '${data.mbrNm}'
        ORDER BY M.SCHD_MEMO_REG_DTM ASC
        `
    },
    getAllSchdMemos : function (data) {
        return `
        SELECT 
            M.SCHD_MEMO_SEQ             AS MEMO_SEQ         -- MEMO KEY
          , M.SCHD_SEQ                  AS SCHD_SEQ         -- 스케줄 SEQ
          , M.SCHD_TP                   AS SCHD_TP          -- 스케줄 TYPE 0: 미팅, 1: 프로젝트
          , MB1.MBR_NM                  AS WRTR
          , DATE_FORMAT(M.SCHD_MEMO_REG_DTM, '%Y-%m-%d %H:%i:%s')   AS MEMO_REG_DTM
          , M.SCHD_MEMO_CNTNTS          AS MEMO_CNTNTS
         FROM SCHD_MEMO M
        INNER JOIN MBR MB1
           ON MB1.MBR_SEQ = M.SCHD_MEMO_REG_MBR_SEQ
        INNER JOIN MBR MB2
           ON MB2.MBR_NM = M.SCHD_OWNER_MBR_NM
        WHERE 1 = 1
          AND M.SCHD_MEMO_USE_TF = 1
        ORDER BY M.SCHD_MEMO_REG_DTM ASC
        `
    }
}


module.exports = memoQuery