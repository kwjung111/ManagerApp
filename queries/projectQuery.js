const dbc = require("../dbconn.js");
const logger = require("../logger.js");

const query = {
  //프로젝트들 조회
  getProjects: function (data) {
    const query = `
    SELECT 
        prj.PRJ_SEQ,
        prj.PRJ_NO,
        prj.PRJ_CNTNTS,
        prj.PRJ_PRGSS_CD,
        prj.PRJ_PRGSS_PRCNT,
        prj.PRJ_IN_CHRG,
        DATE_FORMAT(prj.PRJ_REG_DTM, '%Y-%m-%d %H:%i:%s') AS PRJ_REG_DTM
    FROM PRJ prj
    WHERE prj.PRJ_PRGSS_CD IN (1,2)
    AND prj.PRJ_USE_TF = true;
    `;
    logger.info("getProjects",{message:query});
    return query;
  },
  //프로젝트 상세 조회
  getProjectDetail: function (data) {
    const query = `
    SELECT 
        prj.PRJ_CNTNTS,
        prj.PRJ_PRGSS_CD,
        prj.PRJ_PRGSS_PRCNT,
        prj.PRJ_IN_CHRG,
        mbr.MBR_NM,             -- 등록자
    FROM PRJ prj
    INNER JOIN MBR mbr
        ON mbr.MBR_SEQ = prj.PRJ_REG_MBR_SEQ
    WHERE prj.PRJ_SEQ = ${data.prjSeq}
    `
    logger.info("getProjectDetail",{message:query});
    return query;
  },
  //프로젝트 등록
  postProjects: function (data) {
    const query = `INSERT INTO PRJ(
        PRJ_NO,
        PRJ_CNTNTS,
        PRJ_PRGSS_CD,
        PRJ_PRGSS_PRCNT,
        PRJ_IN_CHRG,
        PRJ_REG_DTM,
        PRJ_REG_MBR_SEQ,
        PRJ_USE_TF
    ) VALUES(
        (SELECT COUNT(0) + 1 FROM
        PRJ prj2
        WHERE 	
        prj2.PRJ_REG_DTM >= DATE_FORMAT(now(), '%Y-%m-01')),
        ${data.contents},
        '1', -- 진행중
        '0',
        ${data.inCharge},
        now(),
        ${data.userData.seq},
        TRUE)`;
    logger.info(query);
    return query;
  },
  //프로젝트 상세 변경
  patchProject: function(data){
    const query = `
    UPDATE PRJ SET
        PRJ_CNTNTS,         -- 프로젝트내용
        PRJ_IN_CHRG,        -- 프로젝트담당자
        PRJ_PRGSS_CD,       -- 프로젝트 진행상태
        PRJ_PRGSS_PRCNT,    -- 프로젝트 진행도 퍼센테이지
        PRJ_MOD_DTM,
    WHERE PRJ_SEQ = ${data.prjSeq}`
    logger.info("patchProjects",{message:query})
    return query
  },
  //프로젝트 논리적 삭제
  deleteProject:function(data){
    const query = `
    UPDATE PRJ SET
        PRJ_USE_TF = false
    WHERE PRJ_SEQ =${data.prjSeq}`
    logger.info("deleteProject",{message:query})
    return query
  },
  //종료된 프로젝트 확인
  getProjectsFin: function(data){
    const query = `
    SELECT 
        prj.PRJ_SEQ,
        prj.PRJ_NO,
        prj.PRJ_CNTNTS,
        prj.PRJ_PRGSS_CD,
        prj.PRJ_PRGSS_PRCNT,
        prj.PRJ_IN_CHRG,
        DATE_FORMAT(prj.PRJ_REG_DTM, '%Y-%m-%d %H:%i:%s') AS PRJ_REG_DTM
    FROM PRJ prj
    WHERE 1=1
        AND prj.PRJ_PRGSS_CD = 0
        AND prj.PRJ_REG_DTM >= '${data.fromDate}'
        AND DATE_FORMAT(prj.PRJ_REG_DTM, '%Y-%m-%d') <= '${data.toDate}'
        AND prj.PRJ_USE_TF = true;`
    logger.info("getProjectsFin",{message:query})
    return query
  }
};

module.exports = query;
