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
        (SELECT count(1) FROM stdb.mg_msgsndgrp_info mmi
        WHERE mmi.SND_STAT_TP IN ('2','3','4')
       AND mmi.SND_REQ_DTM >= DATE_FORMAT(now() - INTERVAL 30 MINUTE , '%Y-%m-%d %H:%i:%s')
       ) AS stdb,
        (SELECT
        count(1) FROM stdb01.mg_msgsndgrp_info mmi 
        WHERE mmi.SND_STAT_TP IN ('2','3','4')
       AND mmi.SND_REQ_DTM >= DATE_FORMAT(now() - INTERVAL 30 MINUTE , '%Y-%m-%d %H:%i:%s'))
       AS stdb01;`
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
    }
}

module.exports = monitoringQuery