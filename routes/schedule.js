const express = require("express")
const router = express.Router();
const util = require("../util.js")
const scheduleQuery = require("../queries/scheduleQuery.js")

router
.get('/',(req,res) => {

    res.send('success')
})


module.exports = router;