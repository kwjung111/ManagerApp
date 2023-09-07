const query = {
    // 게시물 등록
    addPostQuery : function(data){
    return `INSERT INTO BRD (
        BRD_PRGSS_TF,
        BRD_CTNTS,
        BRD_USE_TF,
        BRD_WRTR,
        BRD_POST_CD,
        BRD_ACT_STRT_DTM,
        BRD_REG_DTM
        )VALUES(
        TRUE,
        '${data.content}',
        TRUE,
        '${data.writer}',
        '${data.postCd}',
        NOW(),
        NOW()
    )`},

    addMemoQuery : function(data){
        return `INSERT INTO MEMO(
            BRD_SEQ,
            MEMO_CTNTS,
            MEMO_WRTR,
            MEMO_REG_DTM,
            MEMO_USE_TF 
            )VALUES(
            '${data.postSeq}',
            '${data.content}',
            '${data.writer}',
            NOW(),
            TRUE)`
    },

    // 게시물 논리적 삭제
    removePostQuery : function(data){
        return `UPDATE BRD 
        SET BRD_USE_TF = FALSE
        WHERE 1=1
            AND BRD_SEQ = '${data.postSeq}'`
    },

    removeMemoQuery : function(data){
        return `UPDATE MEMO 
        SET MEMO_USE_TF = FALSE
        WHERE 1=1
            AND MEMO_SEQ ='${data.memoSeq}'`
    },

    //게시물 개수 조회
    getPostsCount : function(){
       return `SELECT COUNT(CASE WHEN 1=1 
            AND BRD_REG_DTM BETWEEN 
                DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
                AND BRD_USE_TF = TRUE THEN 1 END) AS recentPost,
       COUNT(CASE WHEN 1=1
            AND BRD_PRGSS_TF = TRUE
            AND BRD_POST_CD = 1
            AND BRD_USE_TF = TRUE THEN 1 END) AS acting,
       COUNT(CASE WHEN 1=1 
            AND BRD_PRGSS_TF = TRUE
            AND BRD_POST_CD = 2
            AND BRD_USE_TF = TRUE THEN 1 END) AS emergency
        FROM BRD`
    },

    //게시물 내용 조회
    getPosts : function(){
        return `
    SELECT 
	    BRD_SEQ,
	    BRD_PRGSS_TF,
	    BRD_CTNTS,
	    BRD_WRTR,
	    BRD_REG_DTM,
	    CASE 
		    WHEN BRD_PRGSS_TF = TRUE THEN
                SEC_TO_TIME(
                    TIME_TO_SEC(TIMEDIFF(NOW(),IFNULL(BRD_ACT_STRT_DTM,BRD_REG_DTM))) +
                    TIME_TO_SEC(IFNULL(BRD_ACT_TOT_TIME,TIME(0))))
		    WHEN BRD_PRGSS_TF = FALSE
		        THEN IFNULL(BRD_ACT_TOT_TIME,'00:00:00')  END AS BRD_ELAPSED_TIME,
        BRD_POST_CD
    FROM BRD

    WHERE 1=1 
	    AND BRD_USE_TF = TRUE
        AND BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
	ORDER BY BRD_SEQ DESC;`
    },
    
getMemos : function(){
    return `
    SELECT 
	MEMO_SEQ,
	MEMO_WRTR,
	MEMO_REG_DTM,
	MEMO_CTNTS,
    memo.BRD_SEQ
FROM MEMO memo
INNER JOIN BRD brd 
 ON 1=1
 AND brd.BRD_SEQ  = memo.BRD_SEQ 
 -- AND brd.BRD_PRGSS_TF = TRUE /* 항상 보이게 변경 */ 
 AND brd.BRD_USE_TF = TRUE
 AND brd.BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
 
WHERE 1=1 
 AND memo.MEMO_USE_TF  = TRUE`
 },

changePrgState : function(data) {
    return`
    UPDATE BRD
SET BRD_ACT_TOT_TIME = CASE 
	 WHEN BRD_PRGSS_TF = TRUE THEN 
	 -- 진행시간 갱신
	 SEC_TO_TIME(
	 TIME_TO_SEC(TIMEDIFF(NOW(), IFNULL(BRD_ACT_STRT_DTM,BRD_REG_DTM))) + 
	 TIME_TO_SEC(IFNULL(BRD_ACT_TOT_TIME,0)))
	WHEN BRD_PRGSS_TF = FALSE THEN
	BRD_ACT_TOT_TIME
	 END,
	BRD_ACT_STRT_DTM  = CASE 
		WHEN BRD_PRGSS_TF = TRUE THEN BRD_ACT_STRT_DTM
		WHEN BRD_PRGSS_TF = FALSE THEN NOW()
	END,
	BRD_PRGSS_TF = CASE 
		WHEN BRD_PRGSS_TF = TRUE THEN FALSE 
		WHEN BRD_PRGSS_TF = FALSE THEN TRUE
	END
WHERE BRD_SEQ = ${data.postSeq};
`
}

}


module.exports = query