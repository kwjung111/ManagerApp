const express = require("express")
const router = express.Router();
const util = require("../util.js")
const validator = require("../validators/projectsVd.js")
const projectQuery = require("../queries/projectQuery.js")
const {wsJson,broadcast} = require('../wss.js')
const logger = require("../logger.js")

router
.get("/",(req,res)=>{
    util.transaction(req,projectQuery.getProjects)
    .then( (ret)=> {
        res.send(ret)
    })
})

.get("/fin",(req,res)=>{
    const validationMsg = validator.fin(req)
    if(validationMsg !== "PASS"){
        return res.status(400).json({
            message:validationMsg
        })
    }
    util.transaction(req,projectQuery.getProjectsFin)
    .then((ret)=>{
        res.send(ret)
    })
})
.get("/:prjSeq",(req,res)=>{
    const validationMsg = validator.getProjectDetail(req)
    if(validationMsg !== "PASS"){
        return res.status(400).json({
            message:validationMsg
        })
    }
    util.transaction(req,projectQuery.getProjectDetail)
    .then((ret)=>{
        res.send(ret)
    })
})



module.exports = router;