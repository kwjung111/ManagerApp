const express = require("express")
const router = express.Router();
const util = require("../util.js")
const scheduleQuery = require("../queries/scheduleQuery.js")
const meetingQuery = require("../queries/meetingQuery.js")
const projectQuery = require("../queries/projectQuery.js")
const stepQuery = require("../queries/stepQuery.js")
const memoQuery = require("../queries/memoQuery.js")
const mbrQuery = require("../queries/mbrQuery");
const jwt = require("jsonwebtoken");
const { wsJson } = require("../wss.js");
const {broadcast} = require("../wss");
const prvKey = process.env.PRV_KEY;

router
.get('/',(req,res) => {
    // 개인 스케줄 - 진행중+미도래 리스트
    util.transactions(req, [scheduleQuery.getSchds, memoQuery.getSchdMemos], true)
    .then( (ret) => {
        let schds = ret.result[0]
        let memos = ret.result[1]

        ret.result = util.makeTree(schds, memos, 1)
        res.send(ret)
    })
})

.get('/:schdTp/:schdSeq',(req,res) => {
    // 상세보기
    const { schdTp } = req.params;
    if(schdTp == 0) { // 미팅
        util.transaction(req, meetingQuery.getMtng)
        .then((ret) => {
            res.send(ret)
        })
    } else if (schdTp == 1) {   // 프로젝트
    util.transactions(req, [projectQuery.getPrj, stepQuery.getStep], true)
        .then( (ret) => {
            let schds = ret.result[0]
            let memos = ret.result[1]

            ret.result = util.makeTree(schds, memos, 2)
            res.send(ret)
        })
    }
})

.get("/count", (req, res) => {
    // 개인 스케줄 - 왼쪽 화면 카운트
    util.transaction(req, scheduleQuery.getSchdsCount)
    .then( (ret) => {
        res.send(ret)
    })
})

.get("/byMonth", (req, res) => {
    util.transactions(req, [scheduleQuery.getSchdsByMonth, memoQuery.getSchdMemos], true)
        .then( (ret) => {
            let schds = ret.result[0]
            let memos = ret.result[1]

            ret.result = util.makeTree(schds, memos, 1)
            res.send(ret)
        })
})

.post("/:schdTp/post", (req, res) => {
    // 스케줄 등록
    const { schdTp } = req.params;
    if(schdTp == 0) {       // 미팅
        util.transaction(req, meetingQuery.addMtng)
        .then((ret) => {
            ret.result.schdSeq = ret.result.insertId
            ret.result.schdTp = 0
            res.send(ret)
            if(ret.ok == true) {
                broadcast(new wsJson("event").event("PATCH", "schd", ret.result.insertId, req.body.UID))
            }
        })
    } else if (schdTp == 1) {       // 프로젝트
        let steps = req.body.SCHD_STEPS
        let tmp = req;
        // 프로젝트  insert
        util.transaction(req, projectQuery.addPrj)
            .then((ret) => {
                ret.result.schdSeq = ret.result.insertId
                ret.result.schdTp = 1
                for(let i = 0; i < steps.length; i++){
                    tmp.body = steps[i]
                    tmp.body.userData = findSeqAndName(req.headers.authorization)
                    tmp.body.SCHD_SEQ = ret.result.insertId
                    util.transaction(tmp, stepQuery.addStep)
                        .then((ret) => {
                            console.log(ret)
                        })
                }
                res.send(ret)
                if(ret.ok == true) {
                    broadcast(new wsJson("event").event("PATCH", "schd", ret.result.insertId, req.body.UID))
                }
            })
    }
})

.patch("/:schdTp/chgSchd", (req, res) => {
    const { schdTp } = req.params;
    if(schdTp == 0) {   // 미팅
        util.transaction(req, meetingQuery.chgMtng)
            .then((ret) => {
                ret.result.schdSeq = req.body.SCHD_SEQ
                ret.result.schdTp = 0
                res.send(ret)
                if(ret.ok == true) {
                    broadcast(new wsJson("event").event("PATCH", "schd", req.body.SCHD_SEQ, req.body.UID))
                }
            })
    }
    else if(schdTp == 1) {  // 프로젝트
        let steps = req.body.SCHD_STEPS
        let tmp = req;
        // 프로젝트 update
        util.transaction(req, projectQuery.chgPrj)
            .then((ret) => {
                ret.result.schdSeq = req.body.SCHD_SEQ
                ret.result.schdTp = 1
                // 단계 수정 = (기존)단계 삭제 -> (수정내용)단계 생성
                util.transaction(tmp, stepQuery.delStep)
                    .then((ret) => {
                        if(ret.ok == true){
                            console.log("기존 스텝 삭제완료")
                        }
                    })

                for (let i = 0; i < steps.length; i++) {
                    tmp.body = steps[i]
                    tmp.body.userData = findSeqAndName(req.headers.authorization)
                    tmp.body.SCHD_SEQ = ret.result.schdSeq
                    util.transaction(tmp, stepQuery.addStep)
                        .then((ret) => {
                            console.log(ret)
                        })
                }
                res.send(ret)
                if(ret.ok == true) {
                    broadcast(new wsJson("event").event("PATCH", "schd", req.body.SCHD_SEQ, req.body.UID))
                }
            })

    }
})

.patch("/:schdTp/clsSchd", (req, res) => {
    const { schdTp } = req.params;
    if(schdTp == 0) {   // 미팅
        util.transaction(req, meetingQuery.clsMtng)
            .then((ret) => {
                ret.result.schdSeq = req.body.SCHD_SEQ
                ret.result.schdTp = 0
                res.send(ret)
                if(ret.ok == true) {
                    broadcast(new wsJson("event").event("PATCH", "schd", req.body.SCHD_SEQ, req.body.UID))
                }
            })
    } else if(schdTp == 1) {    //
        util.transaction(req, projectQuery.clsPrj)
            .then((ret) => {
                util.transaction(req, stepQuery.clsStep)    // 프로젝트 단계도 논리에 따라 함께 삭제
                    .then((ret) => {
                        console.log("프로젝트 단계 삭제 완료")
                    })

                ret.result.schdSeq = req.body.SCHD_SEQ
                ret.result.schdTp = 1
                res.send(ret)
                if(ret.ok == true) {
                    broadcast(new wsJson("event").event("PATCH", "schd", req.body.SCHD_SEQ, req.body.UID))
                }
            })
    }
})

.post("/:schdTp/memo", (req, res) => {
    const { schdTp } = req.params;
    req.body.SCHD_TP = schdTp
    req.body.mbrNm = req.query.mbrNm
    util.transaction(req, memoQuery.addSchdMemo)
        .then((ret) => {
            ret.result.schdSeq = req.body.SCHD_SEQ
            ret.result.schdTp = 0
            ret.result.memoSeq = ret.result.insertId
            res.send(ret)
            if(ret.ok == true){
                broadcast(new wsJson("event")
                    .event("POST","memos",ret.result.insertId,req.body.UID,req.body.content,{schdSeq:req.body.SCHD_SEQ}))
            }
        })
})

.patch("/:schdTp/memo", (req, res) => {
    const { schdTp } = req.params;
    req.body.SCHD_TP = schdTp
    util.transaction(req, memoQuery.clsSchdMemo)
        .then((ret) => {
            console.log(ret)
            res.send(ret)
            broadcast(new wsJson("event")
                .event("PATCH","memos",req.body.SCHD_MEMO_SEQ,null,null))
        })
})

.get("/all", (req, res) => {
    util.transactions(req, [mbrQuery.getMbrs, scheduleQuery.getAllSchd], true)
        .then((ret) => {
            let mrbs = ret.result[0]
            let schds = ret.result[1]

            // 스케줄이 있는 직원만 반환하기 위해 재 필터링
            let tree = util.makeTree(mrbs, schds, 3)
            let tmp = tree.filter((mbr) => {
                return mbr.schds.length != 0;
            })

            ret.result = tmp
            res.send(ret)
        })
})


function findSeqAndName(token){
    let rt = {};
    jwt.verify(token, prvKey, (err, decoded) => {
        if(err){
            logger.error('schedule.findSeqAndName', {meesage:err});
            rt.status = false;
        } else {
            rt.status = true;
            rt.seq = decoded.seq;
            rt.name = decoded.name;
        }
    });
    return rt;
}

module.exports = router;