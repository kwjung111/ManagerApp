const dbc = require('../dbconn.js')
const logger = require('../logger.js')

const query = {
    // 게시물 등록
    addPost : function(data){
    const query = `INSERT INTO BRD (
        BRD_NO,
        BRD_PRGSS_TF,
        BRD_CTNTS,
        BRD_IN_CHRG,
        BRD_USE_TF,
        BRD_POST_CD,
        REG_MBR_SEQ,
        BRD_ACT_STRT_DTM,
        BRD_REG_DTM
        )VALUES(
        (SELECT COUNT(0) + 1 FROM
        BRD brd
        WHERE 	
        brd.BRD_REG_DTM >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        ),
        TRUE,
        ?,
        ?,
        TRUE,
        ?, -- 일반/긴급
        ?,
        NOW(),
        NOW())`
    return query},

    // 대기 사유 같이 저장하기 위해 insert문 새로 넣음
    addPostEncypt : function(data){
        const query = `INSERT INTO BRD (
        BRD_NO,
        BRD_PRGSS_TF,
        BRD_CTNTS,
        BRD_IN_CHRG,
        BRD_USE_TF,
        BRD_POST_CD,
        REG_MBR_SEQ,
        BRD_RSN_PNDNG,
        BRD_ACT_STRT_DTM,
        BRD_REG_DTM
        )VALUES(
        (SELECT COUNT(0) + 1 FROM
        BRD brd
        WHERE 	
        brd.BRD_REG_DTM >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        ),
        ${dbc.escape(data.prgssTF)},
        ${dbc.escape(data.content)},
        ${dbc.escape(data.inCharge)},
        TRUE,
        1, -- 일반/긴급
        ${dbc.escape(data.userData.seq)},
        ${dbc.escape(data.rsnPndng)},  -- 대기사유
        NOW(),
        NOW())`
        logger.info("addPostQuery",{message:query})
        return query},
    // 게시물 논리적 삭제
    removePost : function(data){
        return `UPDATE BRD 
        SET BRD_USE_TF = FALSE
        WHERE 1=1
            AND BRD_SEQ = ?`
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
        WHERE BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
        `
    },
    //게시물 내용 조회
    getPosts : function(){
        const query = `
        SELECT 
        CONCAT(DATE_FORMAT(brd.BRD_REG_DTM, '%m'),"-",brd.BRD_NO) AS BRD_NO,
	    brd.BRD_SEQ,
	    brd.BRD_PRGSS_TF,
        IFNULL(brd.BRD_IN_CHRG, '')                               AS BRD_IN_CHRG,
	    brd.BRD_CTNTS,
        DATE_FORMAT(brd.BRD_REG_DTM, '%Y-%m-%d %H:%i:%s') AS BRD_REG_DTM,
        brd.BRD_RSN_PNDNG,
        mbr.MBR_NM as WRTR_NM,
	    CASE WHEN brd.BRD_PRGSS_TF = '1' THEN
            SEC_TO_TIME(
                TIME_TO_SEC(TIMEDIFF(NOW(),IFNULL(brd.BRD_ACT_STRT_DTM,brd.BRD_REG_DTM))) +
                TIME_TO_SEC(IFNULL(brd.BRD_ACT_TOT_TIME,TIME(0))))
		    WHEN brd.BRD_PRGSS_TF IN (0,2) THEN 
                IFNULL(brd.BRD_ACT_TOT_TIME,'00:00:00')  END AS BRD_ELAPSED_TIME,
        brd.BRD_POST_CD
    FROM BRD brd
    INNER JOIN MBR mbr
     ON mbr.MBR_SEQ  = brd.REG_MBR_SEQ  
    WHERE 1=1 
	    AND brd.BRD_USE_TF = TRUE
        AND brd.BRD_REG_DTM BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
	ORDER BY brd.BRD_SEQ DESC;`
    return query
    },
    //게시물 상세 조회
    getPost: function(){
        const query =  `
        SELECT 
            brd.BRD_POST_CD		     -- 상태코드(긴급여부)
            ,brd.BRD_CTNTS		     -- 내용
            ,mbr.MBR_NM AS WRTR_NM   -- 작성자
            ,brd.BRD_IN_CHRG         -- 담당자
            ,brd.BRD_PRGSS_TF 	     -- 진행상태 코드
            ,brd.BRD_RSN_PNDNG 	     -- 대기 사유
            ,brd.BRD_END_SYS_TP      -- 종료 - 시스템구분
            ,brd.BRD_END_CTG         -- 종료 - SR유형/에러
            ,brd.BRD_END_CTG_DTL     -- 종료 - 유형 상세
            ,brd2.BRD_NO  AS FOLLOWUP_POST_BRD_NO 			 -- 종료 - 후속조치 게시물번호
        FROM BRD brd
        INNER JOIN MBR mbr
           on mbr.MBR_SEQ = brd.REG_MBR_SEQ
        LEFT OUTER JOIN BRD brd2
            ON brd2.BRD_SEQ = brd.BRD_END_FLLW_UP_SEQ
            AND brd2.BRD_USE_TF = TRUE
        WHERE brd.BRD_SEQ = ? ;`
        return query
    },
    //최근 30분 안에 댓글이 달린 게시물 조회
    getCommentedPost: function(data){
        return`
        SELECT 
            CONCAT(DATE_FORMAT(brd.BRD_REG_DTM, '%m'),"-",brd.BRD_NO) AS BRD_NO,
            brd.BRD_SEQ,
            brd.BRD_PRGSS_TF,
            brd.BRD_IN_CHRG,
            brd.BRD_CTNTS,
            DATE_FORMAT(brd.BRD_REG_DTM, '%Y-%m-%d %H:%i:%s') AS BRD_REG_DTM,
            brd.BRD_RSN_PNDNG,
            brd.REG_MBR_SEQ,
            brd.BRD_POST_CD,
            brd.BRD_USE_TF
        FROM BRD brd
        WHERE brd.BRD_SEQ IN (
            SELECT memo.BRD_SEQ
            FROM MEMO memo
            WHERE memo.MEMO_REG_DTM > DATE_SUB(NOW(), INTERVAL 30 MINUTE)  
            AND memo.MEMO_USE_TF = TRUE
        )
        AND brd.BRD_USE_TF = TRUE
        ORDER BY BRD_REG_DTM ASC;`
    },
    //미처리 건 
    getNotFinPosts: function(data){
        return`
        SELECT 
        CONCAT(DATE_FORMAT(brd.BRD_REG_DTM, '%m'),"-",brd.BRD_NO) AS BRD_NO,
	    brd.BRD_SEQ,
	    brd.BRD_PRGSS_TF,
        IFNULL(brd.BRD_IN_CHRG, '')                     AS BRD_IN_CHRG,
	    brd.BRD_CTNTS,
	    mbr.MBR_NM,
	    DATE_FORMAT(brd.BRD_REG_DTM, '%Y-%m-%d %H:%i:%s') AS BRD_REG_DTM,
        brd.BRD_RSN_PNDNG,
	    CASE WHEN brd.BRD_PRGSS_TF = '1' THEN
            SEC_TO_TIME(
                TIME_TO_SEC(TIMEDIFF(NOW(),IFNULL(brd.BRD_ACT_STRT_DTM,brd.BRD_REG_DTM))) +
                TIME_TO_SEC(IFNULL(brd.BRD_ACT_TOT_TIME,TIME(0))))
		    WHEN brd.BRD_PRGSS_TF IN (0,2) THEN 
                IFNULL(brd.BRD_ACT_TOT_TIME,'00:00:00')  END AS BRD_ELAPSED_TIME,
        brd.BRD_POST_CD
    FROM BRD brd
    INNER JOIN MBR mbr
    	ON mbr.MBR_SEQ = brd.REG_MBR_SEQ 
    WHERE 1=1
	    AND BRD_USE_TF = TRUE
        AND BRD_PRGSS_TF IN (1,2)
        AND BRD_REG_DTM NOT BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND NOW()
	ORDER BY BRD_SEQ DESC;`
    },
    //게시물 수정
    chgPost : function(data){
        
        return ` 
        UPDATE BRD SET 
            BRD_POST_CD  = ${dbc.escape(data.postCd)}                -- 컬럼의 순서 매우 중요!!
            ,BRD_CTNTS   = ${dbc.escape(data.cntns)}
            ,BRD_IN_CHRG = ${dbc.escape(data.inCharge)}
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
            BRD_POST_CD  = ${dbc.escape(data.postCd)}                -- 컬럼의 순서 매우 중요!!
            ,BRD_CTNTS   = ${dbc.escape(data.cntns)}
            ,BRD_IN_CHRG = ${dbc.escape(data.inCharge)}
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
            BRD_IN_CHRG,
            BRD_USE_TF,
            BRD_POST_CD,
            REG_MBR_SEQ,
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
            ${dbc.escape(data.followupInCharge)},
            TRUE,
            ${dbc.escape(data.followUpCd)},
            ${dbc.escape(data.userData.seq)},
            NOW(),
            NOW()
        )`},
        // 완료된 게시물( 달 기준으로 조회)
        getPostsByMonth: function(data){
            const query = `
            SELECT
            CONCAT(DATE_FORMAT(brd.BRD_REG_DTM, '%m'),"-",brd.BRD_NO) AS BRD_NO,
                brd.BRD_SEQ,
                brd.BRD_PRGSS_TF,
                brd.BRD_CTNTS,
                IFNULL(brd.BRD_IN_CHRG, '')                   AS BRD_IN_CHRG,
                mbr.MBR_NM  AS WRTR_NM,
            DATE_FORMAT(brd.BRD_REG_DTM, '%Y-%m-%d %H:%i:%s') AS BRD_REG_DTM,
            brd.BRD_RSN_PNDNG,
            IFNULL(brd.BRD_ACT_TOT_TIME,'00:00:00')  AS BRD_ELAPSED_TIME,
            brd.BRD_POST_CD
        FROM BRD brd
        INNER JOIN MBR mbr
           ON mbr.MBR_SEQ  = brd.REG_MBR_SEQ 
        WHERE 1=1
            AND brd.BRD_PRGSS_TF = '0'
            AND brd.BRD_USE_TF = TRUE
	        AND brd.BRD_REG_DTM >= '${data.fromDate}'
            AND DATE_FORMAT(BRD_REG_DTM, '%Y-%m-%d') <= '${data.toDate}'
		ORDER BY BRD_SEQ DESC  `
            return query
        }
}


module.exports = query