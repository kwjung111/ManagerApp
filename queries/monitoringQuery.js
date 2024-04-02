const logger = require('../logger.js')

const monitoringQuery = {
    getMQInfoQuery : function(data){
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
    }
}

module.exports = monitoringQuery