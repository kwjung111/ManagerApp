const express = require("express")
const router = express.Router();
const util = require("../util.js")
const query = require("../queries/query.js")
const postQuery = require("../queries/postQuery.js")
const {wsJson,broadcast} = require('../wss.js')

/**
 * @swagger
 * paths:
 *  /posts:
 *    get:
 *      summary: "최근 7일 간 전체 게시물 조회"
 *      description: "Get 방식으로 요청"
 *      tags: [posts]
 *      responses:
 *        "200":
 *          description: "최근 7일 간 전체 게시물 조회"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    results:
 *                      type: object
 *                      example:
 *                          [
 *                            { "BRD_POST_SEQ": "1", 
 *                              "BRD_NO": "1" , 
 *                              "BRD_PRGSS_TF" : "2",
 *	                            "BRD_CTNTS":"[SR1] 무슨무슨 오류",
 *	                            "BRD_WRTR": "정강욱",
 *	                            "BRD_REG_DTM":"2023-09-24 11:22:11",
 *                              "BRD_RSN_PNDNG":"대기중인이유"},
 *                          ]
 */
router
.get("/",(req,res)=>{
    util.transaction(req,query.getPosts)
    .then( (ret)=> {
        res.send(ret)
    })
})
.get("/:postSeq",(req,res)=>{
    const { postSeq } = req.params;
    util.transaction(req,query.getPost)
    .then((ret)=>{
        res.send(ret)
    })
})
.post("/",(req,res)=>{
    util.transaction(req,query.addPostQuery)
    .then( (ret)=> {
        ret.result.postSeq = ret.result.insertId       //저장된 게시물넘버 리턴
        res.send(ret)
        console.log(ret)
        if(ret.ok == true){
            const event = new wsJson("event")
            .event("POST","posts",ret.result.insertId,req.body.UID,req.body.content)
            console.log(event)
            broadcast(event)
        }
    })
})
.patch("/prgState",(req,res)=>{
    console.log(req.body)
    util.transaction(req,query.changePrgState)
    .then( (ret)=> {
        res.send(ret)
        if(ret.ok == true){
            broadcast(new wsJson("event").event("PATCH","posts",req.body.postSeq,req.body.UID))
        }
    })
})
.patch("/chgPost",(req,res)=>{
    util.transaction(req,postQuery.chgPost)
    .then( (ret) => {
        res.send(ret)
        if(ret.ok == true){
            broadcast(new wsJson("event").event("PATCH","posts",req.body.postSeq,req.body.UID))
        }
    })

})
//TODO 트랜잭션 공통화
.patch("/clsPost",(req,res)=>{
    let queries;

    if(req.body.followUp == 1){    //후속 게시물 등록
        queries = [postQuery.addFollowUpPost,postQuery.clsPost]
    }else{
        queries = [postQuery.clsPost]
    }

    util.transactions(req,queries,false) //쿼리 동기화
    .then((ret) => {
        res.send(ret)
        if(ret.ok == true){
            if(req.body.followUp == 1){    //후속게시물 등록시
                let meta = {
                    followUp : req.body.addFollowUpPost.insertId,        //함수이름 하드코딩
                }
                broadcast(new wsJson("event")
                .event("PATCH"
                ,"posts"
                ,req.body.postSeq
                ,req.body.UID
                ,req.body.followUpCntns
                ,meta))
            }
            else{
                broadcast(new wsJson("event")
                .event(
                    "PATCH"
                    ,"posts"
                    ,req.body.postSeq
                    ,req.body.UID
                    ,null))
            }
        }
    })

})

.delete("/:postSeq",async (req,res)=>{
    const { postSeq } = req.params;
    util.transaction(req,query.removePostQuery)
    .then( (ret)=> {
        res.send(ret)
        if(ret.ok == true){
            broadcast(new wsJson("event").event("DELETE","posts",req.params.postSeq,null,null))
        }
    })

})

module.exports = router;