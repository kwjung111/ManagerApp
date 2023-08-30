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

    //게시물 조회
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
    }
    //

}

module.exports = query