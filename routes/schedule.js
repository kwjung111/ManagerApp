const express = require("express")
const router = express.Router();
const util = require("../util.js")
const scheduleQuery = require("../queries/scheduleQuery.js")
const meetingQuery = require("../queries/meetingQuery.js")
const projectQuery = require("../queries/projectQuery.js")
const stepQuery = require("../queries/stepQuery.js")
const jwt = require("jsonwebtoken");
const { wsJson } = require("../wss.js");
const {broadcast} = require("../wss");
const prvKey = process.env.PRV_KEY;

router
.get('/',(req,res) => {
    // 개인 스케줄 - 리스트
    util.transaction(req, scheduleQuery.getSchds)
    .then( (ret) => {
        res.send(ret)
    })
})

.get('/:schdTp/:schdSeq',(req,res) => {
    // const { schdSeq } = req.params;
    const { schdTp } = req.params;
    if(schdTp == 0) { // 미팅
        util.transaction(req, meetingQuery.getMtng)
        .then((ret) => {
            res.send(ret)
        })
    } else if (schdTp == 1) {   // 프로젝트
        util.transaction(req, projectQuery.getPrj)
        .then((ret) => {
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
    // 최근 3개월 스케줄
    util.transaction(req, scheduleQuery.getSchdsByMonth)
    .then( (ret) => {
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
                    tmp.body.PRJ_SEQ = ret.result.insertId
                    util.transaction(tmp, stepQuery.addStep)
                        .then((ret) => {
                            console.log(ret)
                        })
                }
                res.send(ret)
            })
    }
})

.patch("/:schdTp/chgSchd", (req, res) => {
    const { schdTp } = req.params;
    if(schdTp == 0) {   // 미팅
        util.transaction(req, meetingQuery.chgMtng)
            .then((ret) => {
                res.send(ret)
                if(ret.ok == true) {    // 왜 broadcast 하는지 모름 ( 일단 api 자체를 post에 맞춰 작성하고 있기 때문에 따라하기 )
                    broadcast(new wsJson("event").event("PATCH", "schds", req.body.schdSeq, req.body.UID))
                }
            })
    }
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