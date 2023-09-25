const dbc = require('../dbconn.js')

const query = {
    // 게시물 등록
    addPost : function(data){
    return`INSERT INTO BRD (
        BRD_NO,
        BRD_PRGSS_TF,
        BRD_CTNTS,
        BRD_USE_TF,
        BRD_WRTR,
        BRD_POST_CD,
        BRD_ACT_STRT_DTM,
        BRD_REG_DTM
        )VALUES(
        (SELECT COUNT(0) + 1 FROM
        BRD brd
        WHERE 	
        brd.BRD_REG_DTM >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        ),
        TRUE,
        ${dbc.escape(data.content)},
        TRUE,
        ${dbc.escape(data.writer)},
        ${dbc.escape(data.postCd)},
        NOW(),
        NOW()
    )`},

    // 게시물 논리적 삭제
    removePost : function(data){
        return `UPDATE BRD 
        SET BRD_USE_TF = FALSE
        WHERE 1=1
            AND BRD_SEQ = ${dbc.escape(data.postSeq)}`
    },
    //게시물 개수 조회
    getPostsCount : function(){
       return `
        SELECT 
            COUNT(CASE WHEN 1=1 
                AND BRD_USE_TF = TRUE THEN 1 END) AS recentPost,
            COUNT(CASE WHEN 1=1
                AND BRD_PRGSS_TF = '1'
                AND BRD_POST_CD = 1
                AND BRD_USE_TF = TRUE THEN 1 END) AS acting,
            COUNT(CASE WHEN 1=1 
                AND BRD_PRGSS_TF = '1'
                AND BRD_POST_CD = 2
                AND BRD_USE_TF = TRUE THEN 1 END) AS emergency,
            COUNT(CASE WHEN 1=1
                AND BRD_PRGSS_TF = '2'
                AND BRD_USE_TF = TRUE THEN 1 END) AS pending
        FROM BRD
        -- WHERE BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
        `
    },

    //게시물 내용 조회
    getPosts : function(){
        return `
    SELECT 
        CONCAT(DATE_FORMAT(BRD_REG_DTM, '%m'),"-",BRD_NO) AS BRD_NO,
	    BRD_SEQ,
	    BRD_PRGSS_TF,
	    BRD_CTNTS,
	    BRD_WRTR,
	    BRD_REG_DTM,
        BRD_RSN_PNDNG,
	    CASE WHEN BRD_PRGSS_TF = '1' THEN
            SEC_TO_TIME(
                TIME_TO_SEC(TIMEDIFF(NOW(),IFNULL(BRD_ACT_STRT_DTM,BRD_REG_DTM))) +
                TIME_TO_SEC(IFNULL(BRD_ACT_TOT_TIME,TIME(0))))
		    WHEN BRD_PRGSS_TF IN (0,2) THEN 
                IFNULL(BRD_ACT_TOT_TIME,'00:00:00')  END AS BRD_ELAPSED_TIME,
        BRD_POST_CD
    FROM BRD

    WHERE 1=1 
	    AND BRD_USE_TF = TRUE
        AND BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
	ORDER BY BRD_SEQ DESC;`
    },
    //게시물 상세 조회
    getPost: function(data){
        return `
        SELECT 
            brd.BRD_POST_CD		     -- 상태코드(긴급여부)
            ,brd.BRD_CTNTS		     -- 내용
            ,brd.BRD_WRTR     	     -- 작성자
            ,brd.BRD_PRGSS_TF 	     -- 진행상태 코드
            ,brd.BRD_RSN_PNDNG 	     -- 대기 사유
            ,brd.BRD_END_SYS_TP      -- 종료 - 시스템구분
            ,brd.BRD_END_CTG          -- 종료 - SR유형/에러
            ,brd.BRD_END_CTG_DTL      -- 종료 - 유형 상세
            ,brd2.BRD_NO  AS FOLLOWUP_POST_BRD_NO 			 -- 종료 - 후속조치 게시물번호
        FROM BRD brd
        LEFT OUTER JOIN BRD brd2
            ON brd2.BRD_SEQ = brd.BRD_END_FLLW_UP_SEQ
            AND brd2.BRD_USE_TF = TRUE
        WHERE brd.BRD_SEQ = ${dbc.escape(data.postSeq)};`
    },
    
    //게시물 수정
    chgPost : function(data){
        
        return ` 
        UPDATE BRD SET 
            BRD_POST_CD = ${dbc.escape(data.postCd)}                -- 컬럼의 순서 매우 중요!!
            ,BRD_CTNTS  = ${dbc.escape(data.cntns)}
            ,BRD_WRTR = ${dbc.escape(data.writer)}
            ,BRD_ACT_TOT_TIME = CASE -- 진행시간 갱신
                WHEN BRD_PRGSS_TF = '1' AND ${dbc.escape(data.prgCd)} IN ('0','2') THEN -- 진행중 -> 종료, 대기
                    SEC_TO_TIME(
                        TIME_TO_SEC(TIMEDIFF(NOW(), IFNULL(BRD_ACT_STRT_DTM,BRD_REG_DTM))) + 
                        TIME_TO_SEC(IFNULL(BRD_ACT_TOT_TIME,0)))
                ELSE BRD_ACT_TOT_TIME END 
            ,BRD_ACT_STRT_DTM  = CASE
                WHEN BRD_PRGSS_TF = '1' AND ${dbc.escape(data.prgCd)} IN ('0','2') THEN NOW()   -- 진행중 -> 종료, 대기
                WHEN BRD_PRGSS_TF IN ('0','2') AND ${dbc.escape(data.prgCd)} = '1' THEN NOW()   -- 종료,대기 -> 진행중
                ELSE BRD_ACT_STRT_DTM END
            ,BRD_PRGSS_TF  = ${dbc.escape(data.prgCd)}
            ,BRD_RSN_PNDNG = CASE
                WHEN  ${dbc.escape(data.prgCd)} = '2' THEN ${dbc.escape(data.rsnPndg)}
                ELSE BRD_RSN_PNDNG END
            ,BRD_MOD_DTM = NOW()
        WHERE BRD_SEQ  = ${dbc.escape(data.postSeq)};`
    },
    //게시물 수정 및 완료 - 함수 이름 하드코딩에 주의
    clsPost : function(data){
        return `
        UPDATE BRD SET 
            BRD_POST_CD = ${dbc.escape(data.postCd)}                -- 컬럼의 순서 매우 중요!!
            ,BRD_CTNTS  = ${dbc.escape(data.cntns)}
            ,BRD_WRTR = ${dbc.escape(data.writer)}
            ,BRD_ACT_TOT_TIME = CASE -- 진행시간 갱신
                WHEN BRD_PRGSS_TF = '1' AND ${dbc.escape(data.prgCd)} IN ('0','2') THEN -- 진행중 -> 종료, 대기
                    SEC_TO_TIME(
                        TIME_TO_SEC(TIMEDIFF(NOW(), IFNULL(BRD_ACT_STRT_DTM,BRD_REG_DTM))) + 
                        TIME_TO_SEC(IFNULL(BRD_ACT_TOT_TIME,0)))
                ELSE BRD_ACT_TOT_TIME END 
            ,BRD_ACT_STRT_DTM  = CASE
                WHEN BRD_PRGSS_TF = '1' AND ${dbc.escape(data.prgCd)} IN ('0','2') THEN NOW()   -- 진행중 -> 종료, 대기
                WHEN BRD_PRGSS_TF IN ('0','2') AND ${dbc.escape(data.prgCd)} = '1' THEN NOW()   -- 종료,대기 -> 진행중
                ELSE BRD_ACT_STRT_DTM END
            ,BRD_PRGSS_TF  = ${dbc.escape(data.prgCd)} 
            ,BRD_END_SYS_TP = ${dbc.escape(data.sysTp)}
            ,BRD_END_CTG = ${dbc.escape(data.postCtg)}
            ,BRD_END_CTG_DTL = ${dbc.escape(data.postCtgDtl)}
            ,BRD_END_FLLW_UP_SEQ = IFNULL(${dbc.escape(data?.addFollowUpPost?.insertId)} ,BRD_END_FLLW_UP_SEQ)
            ,BRD_MOD_DTM = NOW()
        WHERE BRD_SEQ  = ${dbc.escape(data.postSeq)};`
    },
    //후속 게시물 등록
    addFollowUpPost : function(data){
        return`INSERT INTO BRD (
            BRD_NO,
            BRD_PRGSS_TF,
            BRD_CTNTS,
            BRD_USE_TF,
            BRD_WRTR,
            BRD_POST_CD,
            BRD_ACT_STRT_DTM,
            BRD_REG_DTM
            )VALUES(
            (SELECT COUNT(0) + 1 FROM
            BRD brd
            WHERE 	
            brd.BRD_REG_DTM >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
            ),
            TRUE,
            ${dbc.escape(data.followUpCntns)},
            TRUE,
            ${dbc.escape(data.writer)},
            ${dbc.escape(data.followUpCd)},
            NOW(),
            NOW()
        )`},
}


module.exports = query