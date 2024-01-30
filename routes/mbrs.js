const express = require("express")
const router = express.Router();
const util = require("../util.js")
const mbrQuery = require("../queries/mbrQuery");

router
.get('/',(req,res) => {
    // 회원 명단과 seq
    util.transaction(req, mbrQuery.getMbrs)
        .then( (ret) => {
            res.send(ret)
        })
})

.get('/count', (req, res) => {
    util.transaction(req, mbrQuery.getCount)
        .then((ret) => {
            res.send(ret)
        })
})

module.exports = router;