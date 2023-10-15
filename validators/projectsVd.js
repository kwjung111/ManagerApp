const util = require('../util.js')

const validator = {
    fin:function(req){
        const params = util.parseReqBody(req)
        if(!params.fromDate) return "fromDate 항목 없음";
        if(!params.toDate) return "toDate 항목 없음";
        if(!util.dateCheckYMD(params.fromDate)) return "fromDate 유효성 검사 실패";
        if(!util.dateCheckYMD(params.toDate)) return "toDate 유효성 검사 실패";
        
        return "PASS"
    },
    getProjectDetail:function(req){
        const params = util.parseReqBody(req)
        if(!params.prjSeq) return "prjSeq 항목 없음"
        if(! typeof params.prjSeq !== 'number') return "prjSeq 유효성 검사 실패"

        return "PASS"
    }

}

module.exports = validator