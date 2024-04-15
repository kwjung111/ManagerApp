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
        SELECT SUM(CNT) AS count FROM (
            SELECT 
            count(1) AS CNT
                FROM stdb.mg_msgsndgrp_info mmi
        WHERE mmi.SND_STAT_TP IN ('2','3','4','6')
         AND (CASE WHEN mmi.SND_POV_TP = '2' THEN SND_RESV_DTM ELSE SND_REQ_DTM END) <= DATE_FORMAT(now() - INTERVAL 30 MINUTE , '%Y-%m-%d %H:%i:%s')
         AND (CASE WHEN mmi.SND_POV_TP = '2' THEN SND_RESV_DTM ELSE SND_REQ_DTM END) >= DATE_FORMAT(now() - INTERVAL 7 DAY , '%Y-%m-%d %H:%i:%s')
        UNION ALL 
        SELECT 
            count(1) AS CNT
            FROM stdb01.mg_msgsndgrp_info mmi
            WHERE mmi.SND_STAT_TP IN ('2','3','4','6')
         AND (CASE WHEN mmi.SND_POV_TP = '2' THEN SND_RESV_DTM ELSE SND_REQ_DTM END) <= DATE_FORMAT(now() - INTERVAL 30 MINUTE , '%Y-%m-%d %H:%i:%s')
         AND (CASE WHEN mmi.SND_POV_TP = '2' THEN SND_RESV_DTM ELSE SND_REQ_DTM END) >= DATE_FORMAT(now() - INTERVAL 7 DAY , '%Y-%m-%d %H:%i:%s')
         ) COUNTS;`
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