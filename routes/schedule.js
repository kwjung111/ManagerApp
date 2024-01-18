const express = require("express")
const router = express.Router();
const util = require("../util.js")
const scheduleQuery = require("../queries/scheduleQuery.js")
const meetingQuery = require("../queries/meetingQuery.js")
const projectQuery = require("../queries/projectQuery")
const jwt = require("jsonwebtoken");
const { wsJson } = require("../wss.js");
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
            ret.result.postSeq = ret.result.insertId
            res.send(ret)
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