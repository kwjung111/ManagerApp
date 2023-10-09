const express = require("express")
const router = express.Router();
const util = require("../util.js")
const meetingQuery = require("../queries/meetingQuery.js")

router
.get('/',(req,res) => {

    res.send('meeting')
})

module.exports = router;