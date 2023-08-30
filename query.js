const query = {
    // 게시물 등록
    addPostQuery : function(content,writer){
    return `INSERT INTO BRD (
        BRD_PRGSS_TF,
        BRD_CTNTS,
        BRD_USE_TF,
        BRD_WRTR,
        BRD_POST_CD,
        BRD_REG_DTM
        )VALUES(
        TRUE,
        '${content}',
        TRUE,
        '${writer}',
        '1',
        NOW()
    )`},

    // 게시물 논리적 삭제
    removePostQuery : function(postSeq){
        return `UPDATE BRD 
        SET BRD_USE_TF = FALSE
        WHERE 1=1
            AND BRD_SEQ = '${postSeq}'`
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
	BRD_ACT_TOT_TIME
FROM BRD
WHERE 1=1 
	AND BRD_USE_TF = TRUE
	AND BRD_PRGSS_TF = TRUE`
    },
    
getMemos : function(){
    return `
    SELECT 
	MEMO_SEQ,
	MEMO_WRTR,
	MEMO_REG_DTM,
	MEMO_CTNTS
FROM MEMO memo
INNER JOIN BRD brd 
 ON 1=1
 AND brd.BRD_SEQ  = memo.BRD_SEQ 
 AND brd.BRD_PRGSS_TF = TRUE 
 AND brd.BRD_USE_TF = TRUE
WHERE 1=1 
 AND memo.MEMO_USE_TF  = TRUE`

}

}


module.exports = query