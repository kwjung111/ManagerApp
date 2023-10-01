//테스트 라우터
const express = require("express")
const router = express.Router();
const {wsJson,broadcast} = require('../wss.js')

router
.get('/event',(req,res)=>{
    const event = new wsJson("event")
            .event("POST","posts",'233','uid','content')
            console.log(event)
            broadcast(event)
    res.send('event')
})



module.exports = router;