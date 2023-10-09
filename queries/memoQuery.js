const dbc = require('../dbconn.js')

const memoQuery = {
    //댓글 등록
addMemoQuery : function(data){
    return `INSERT INTO MEMO(
        BRD_SEQ,
        MEMO_CTNTS,
        REG_MBR_SEQ,
        MEMO_REG_DTM,   
        MEMO_USE_TF
        )VALUES(
        ${dbc.escape(data.postSeq)},
        ${dbc.escape(data.content)},
        ${dbc.escape(data.userData.seq)},
        NOW(),
        TRUE)`
},
    //댓글 조회
getMemos : function(){
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
AND brd.BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
 INNER JOIN MBR mbr
 on memo.REG_MBR_SEQ  = mbr.MBR_SEQ 
 
WHERE 1=1 
 AND memo.MEMO_USE_TF  = TRUE`
 },
 //댓글 제거
 removeMemoQuery : function(data){
    return `UPDATE MEMO 
    SET MEMO_USE_TF = FALSE
    WHERE 1=1
        AND MEMO_SEQ =${dbc.escape(data.memoSeq)}`
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

}


module.exports = memoQuery