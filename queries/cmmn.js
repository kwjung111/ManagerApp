const dbc = require("../dbconn.js");
const cmmnQuery = {
  getCmCd: function (data) {
    return `
    SELECT 
        CCI.CM_ITM_NM,
        CCI.CM_ITM_CD
    FROM CM_CD_GRP CCG
    INNER JOIN CM_CD_ITM CCI 
    ON CCI.CM_GRP_CD = CCG.CM_GRP_CD 
    AND  CCI.USE_TF = TRUE

    WHERE CCG.CM_GRP_CD  = ?  -- 공통코드
    AND CCG.USE_TF = TRUE 
    ORDER BY CCI.SORT_ORDR ; `
  },

  getNasInfo: function (data) {
    const query = `
    SELECT CLSS, TITLE, SUMMARY, KEYWORDS, FILE_PATH 
    FROM NAS.NAS_DOC
    WHERE KEYWORDS LIKE ? 
    OR FILE_NAME LIKE ?
    OR SUMMARY LIKE ? ;
    `
    // const query = `
    // SELECT CLSS, TITLE, SUMMARY, KEYWORDS, FILE_PATH
    // FROM tmp.nas_doc
    // WHERE KEYWORDS LIKE ? ;
    // `
    return query;
  }
};

module.exports = cmmnQuery;
