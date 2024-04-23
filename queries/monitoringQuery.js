const logger = require('../logger.js')

const monitoringQuery = {
    getMQInfo : function(data){
        const query = `
        SELECT
        (SELECT 
        count(1)
        FROM stdb.tr_postran_hdr tph 
        WHERE 
        tph.SAL_DT = DATE_FORMAT(NOW(), '%Y%m%d')
        AND tph.BO_RCV_DTM >= DATE_FORMAT(now() - INTERVAL 30 SECOND, '%Y-%m-%d %H:%i:%s'))
        AS stdb,
        
        (SELECT 
        count(1)
        FROM stdb01.tr_postran_hdr tph2 
        WHERE 
        tph2.SAL_DT = DATE_FORMAT(NOW(), '%Y%m%d')
        AND tph2.BO_RCV_DTM >= DATE_FORMAT(now() - INTERVAL 30 SECOND, '%Y-%m-%d %H:%i:%s'))
        AS stdb01;`;
        return query;
    },
    getTmsInfo : function(data){
        const query = `
		SELECT
		SUM(A.CNT_LVL_1) AS CNT_LVL_1
		, SUM(A.CNT_LVL_2) AS CNT_LVL_2
		, SUM(A.CNT_LVL_3) AS CNT_LVL_3
	FROM (
		SELECT
			0 AS CNT_LVL_1
			, 0 AS CNT_LVL_2
			, 0 AS CNT_LVL_3
		FROM DUAL
		
		UNION ALL
	
		-- 1. PUSH 발송 시작 지연
		SELECT
			IF(MAX(TARG.NOTI_PROC_STAT) = '01', 1, 0) AS CNT_LVL_1
			, 0 AS CNT_LVL_2
			, 0 AS CNT_LVL_3
		FROM ridb.op_cm_mshp_noti NOTI
		INNER JOIN ridb.op_cm_mshp_noti_targ TARG
			ON TARG.OP_MSHP_NOTI_NO = NOTI.OP_MSHP_NOTI_NO
		WHERE 1=1
			AND NOTI.RESERV_DTM >= STR_TO_DATE(DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s')
			AND NOTI.RESERV_DTM <= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
			AND NOTI.NOTI_METH = '5'
			AND NOTI.COMP_YN = '0'
		GROUP BY NOTI.OP_MSHP_NOTI_NO
		-- TARG이 01이나 05만 있으므로 BACKUP 테이블 참조할 필요 없음
		
		UNION ALL
		
		-- 2. 발송 요청 지연 - PUSH ONLY 및 PUSH+문자&알림톡 PUSH 부분, 인증 문자
		SELECT
			0 AS CNT_LVL_1
			, IF(MIN(B.MOD_DTM) <= DATE_SUB(NOW(), INTERVAL 10 MINUTE), 1, 0) AS CNT_LVL_2
			, 0 AS CNT_LVL_3
		FROM (
			SELECT
				NOTI.OP_MSHP_NOTI_NO
				, TARG.NOTI_PROC_STAT
				, TARG.MOD_DTM
			FROM ridb.op_cm_mshp_noti NOTI
			INNER JOIN ridb.op_cm_mshp_noti_targ TARG
				ON TARG.OP_MSHP_NOTI_NO = NOTI.OP_MSHP_NOTI_NO
			WHERE 1=1
				AND NOTI.RESERV_DTM >= STR_TO_DATE(DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s')
				AND NOTI.NOTI_METH IN ('2', '5')
				AND NOTI.COMP_YN = '0'
				AND NOTI.OP_TASK_CD = 'CMNT0001'
			
			UNION ALL
			
			SELECT
				NOTI.OP_MSHP_NOTI_NO
				, TARG.NOTI_PROC_STAT
				, TARG.MOD_DTM
			FROM ridb.op_cm_mshp_noti NOTI
			INNER JOIN ridb.op_cm_mshp_noti_targ_backup TARG
				ON TARG.OP_MSHP_NOTI_NO = NOTI.OP_MSHP_NOTI_NO
			WHERE 1=1
				AND NOTI.RESERV_DTM >= STR_TO_DATE(DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %H:%i:%s')
				AND NOTI.NOTI_METH IN ('2', '5')
				AND NOTI.COMP_YN = '0'
				AND NOTI.OP_TASK_CD = 'CMNT0001'
		) B
		GROUP BY B.OP_MSHP_NOTI_NO
		HAVING MAX(B.NOTI_PROC_STAT) = '05'
		
		UNION ALL 
		
		-- 발송전인 건들 (통합메세지만 보낼경우) 
		SELECT 
		0 AS CNT_LVL_1
		,sum(CNT_LVL_2) AS CNT_LVL_2
		, 0 AS CNT_LVL_3
		FROM 
		(SELECT 
			count(1) AS CNT_LVL_2
		FROM stdb.mg_msgsndgrp_info mmi 
		WHERE 1=1
			AND  (mmi.APP_SND_YN = '0' OR (mmi.APP_SND_YN = '1' AND mmi.APP_SND_TGET_CNT = '0')) -- 통합메세지 ONLY 조건
			AND (CASE WHEN mmi.SND_POV_TP = '2' THEN mmi.SND_RESV_DTM ELSE mmi.SND_REQ_DTM END) <= DATE_FORMAT(now() - INTERVAL 10 MINUTE, '%Y-%m-%d %H:%i:%s' ) 
			AND (CASE WHEN mmi.SND_POV_TP = '2' THEN mmi.SND_RESV_DTM ELSE mmi.SND_REQ_DTM END) >  DATE_FORMAT(now(), '%Y-%m-%d 00:00:00' )
			AND mmi.SND_STAT_TP = '1'
		UNION ALL 
		SELECT 
			count(1) AS CNT_LVL_2
		FROM stdb01.mg_msgsndgrp_info mmi 
		WHERE 1=1
			AND  (mmi.APP_SND_YN = '0' OR (mmi.APP_SND_YN = '1' AND mmi.APP_SND_TGET_CNT = '0')) -- 통합메세지 ONLY 조건
			AND (CASE WHEN mmi.SND_POV_TP = '2' THEN mmi.SND_RESV_DTM ELSE mmi.SND_REQ_DTM END) <= DATE_FORMAT(now() - INTERVAL 10 MINUTE, '%Y-%m-%d %H:%i:%s' ) 
			AND (CASE WHEN mmi.SND_POV_TP = '2' THEN mmi.SND_RESV_DTM ELSE mmi.SND_REQ_DTM END) >  DATE_FORMAT(now(), '%Y-%m-%d 00:00:00' )
			AND mmi.SND_STAT_TP = '1'
			) C 
		
		UNION ALL 
		
		-- 발송중인 건들 ( 앱푸시 + 문자, 알림톡)
		SELECT 
		0 AS CNT_LVL_1
		, sum(CNT_LVL_2) AS CNT_LVL_2
		, 0 AS CNT_LVL_3
		FROM 
		(SELECT 
			count(1) AS CNT_LVL_2 
		FROM stdb.mg_msgsndgrp_info mmi
		INNER JOIN ridb.op_cm_mshp_noti ocmn 
			ON ocmn.OP_MSHP_NOTI_NO = mmi.CUST_NOTI_NO 
		WHERE 1=1
			AND (mmi.APP_SND_YN = '1' AND mmi.APP_SND_TGET_CNT > '0' AND (NOTI_TOK_SND_YN='1' OR LMS_SND_YN='1' OR MMS_SND_YN='1' OR SMS_SND_YN='1')) -- PUSH + 통메 조건
			AND ocmn.COMP_DTM <= DATE_FORMAT(now() - INTERVAL 10 MINUTE, '%Y-%m-%d %H:%i:%s' )
			AND ocmn.COMP_DTM >  DATE_FORMAT(now(), '%Y-%m-%d 00:00:00')
			AND ocmn.COMP_YN = '1' 
			AND SND_STAT_TP = '3'
		UNION ALL 
		SELECT 
			count(1) AS CNT_LVL_2
		FROM stdb01.mg_msgsndgrp_info mmi
		INNER JOIN ridb.op_cm_mshp_noti ocmn 
			ON ocmn.OP_MSHP_NOTI_NO = mmi.CUST_NOTI_NO 
		WHERE 1=1
			AND (mmi.APP_SND_YN = '1' AND mmi.APP_SND_TGET_CNT > '0' AND (NOTI_TOK_SND_YN='1' OR LMS_SND_YN='1' OR MMS_SND_YN='1' OR SMS_SND_YN='1')) -- PUSH + 통메 조건
			AND ocmn.COMP_DTM <= DATE_FORMAT(now() - INTERVAL 10 MINUTE, '%Y-%m-%d %H:%i:%s' )
			AND ocmn.COMP_DTM >  DATE_FORMAT(now(), '%Y-%m-%d 00:00:00')
			AND ocmn.COMP_YN = '1' 
			AND SND_STAT_TP = '3'
		) D
			
	) A
;`
       return query;
    },
    getNaverInfo : function(data){
        const query = `
        select
        (SELECT COUNT(1) 
        FROM RIDB.NAVER_ORDERS
        WHERE DATE(ORDER_DATE) = CURDATE()
        ) AS today,
        (SELECT COUNT(1)
        FROM RIDB.NAVER_ORDERS) AS total;
        `
        return query
    },
    getAppSndInfo : function(data){
        const query = `
        SELECT
         SUM(A.TOT_CNT) AS TOT_CNT
         , SUM(A.COMP_CNT) AS COMP_CNT
         , IF(A.TOT_CNT > 0 AND 1.0*SUM(A.COMP_CNT)/SUM(A.TOT_CNT) < 0.9, 1, 0) AS ALARM_YN
         , IF(SUM(A.TOT_CNT) = 0, '-', CONCAT(FLOOR(100.0*SUM(A.COMP_CNT)/SUM(A.TOT_CNT)), '%')) AS COMP_RT
        FROM (
         SELECT
          COUNT(NOTI.OP_MSHP_NOTI_NO) AS TOT_CNT
          , COUNT(IF(COMP_YN='1', NOTI.OP_MSHP_NOTI_NO, NULL)) AS COMP_CNT
         FROM RIDB.op_cm_mshp_noti NOTI
         WHERE 1=1
          AND NOTI.REQ_DTM <= DATE_SUB(NOW(), INTERVAL 10 SECOND)
          AND NOTI.REQ_DTM >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          AND NOTI.OP_TASK_CD = 'CMNT0001'
          AND NOTI_METH = '2'
         UNION ALL
         SELECT 
          COUNT(NOTI.OP_MSHP_NOTI_NO) AS TOT_CNT
          , COUNT(IF(COMP_YN='1', NOTI.OP_MSHP_NOTI_NO, NULL)) AS COMP_CNT
         FROM RIDB.op_cm_mshp_noti_backup NOTI
         WHERE 1=1
          AND NOTI.REQ_DTM <= DATE_SUB(NOW(), INTERVAL 10 SECOND)
          AND NOTI.REQ_DTM >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          AND NOTI.OP_TASK_CD = 'CMNT0001'
          AND NOTI_METH = '2'
        ) A`
        return query
    }
}

module.exports = monitoringQuery