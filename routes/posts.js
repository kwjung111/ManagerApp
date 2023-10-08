const express = require("express")
const router = express.Router();
const util = require("../util.js")
const postQuery = require("../queries/postQuery.js")
const memoQuery = require("../queries/memoQuery.js")
const {wsJson,broadcast} = require('../wss.js')


router
.get("/",(req,res)=>{
    util.transaction(req,postQuery.getPosts)
    .then( (ret)=> {
        res.send(ret)
    })
})

.get("/count",(req,res)=>{
    util.transaction(req,postQuery.getPostsCount)
    .then( (ret)=> {
        res.send(ret)
    })
})

.get('/tree',async (req,res) =>{


    util.transactions(req,[postQuery.getPosts,memoQuery.getMemos],true)
    .then((ret) => {
        let posts = ret.result[0]
        let memos = ret.result[1]
                
        ret.result = util.makeTree(posts,memos)
        res.send(ret)
    })
})  

.get('/notFin',(req,res) =>{
    util.transaction(req,postQuery.getNotFinPosts)
    .then((ret) => {
        
        const posts = ret.result

        if(ret.result.length){
            const dataArr = ret.result
            const seqs = dataArr.reduce((acc,cur,idx) =>{
                const seq = cur.BRD_SEQ;
                acc.push(seq)
                if(idx == dataArr.length-1){
                    return `(${acc.join(',')})` //마지막에 괄호로 묶기
                }else{
                    return acc
                }
            },[])

            ///TODO 공통화
            const seqData = {
                method:"SERVICE",
                data:{
                seqs : seqs,
                 },
            }
        
            util.transaction(seqData,memoQuery.getMemosBySeqs)
            .then((ret) =>{
                memos = ret.result
                ret.result = util.makeTree(posts,memos)
                res.send(ret)
            });
        }
        else{   //미처리 게시물 없을시
            res.send(ret)
        }
    })

})

.get('/byMonth', (req,res) => {

    if(!getPostByMonthValidator(req)){
        res.status(400).json('날짜 형식이 맞지 않음')
        return
    }
    util.transaction(req,postQuery.getPostsByMonth)
    .then((ret) => {
 
        const posts = ret.result

        if(ret.result.length){
            const dataArr = ret.result
            const seqs = dataArr.reduce((acc,cur,idx) =>{
                const seq = cur.BRD_SEQ;
                acc.push(seq)
                if(idx == dataArr.length-1){
                    return `(${acc.join(',')})` //마지막에 괄호로 묶기
                }else{
                    return acc
                }
            },[])

            ///TODO 공통화
            const seqData = {
                method:"SERVICE",
                data:{
                seqs : seqs,
                 },
            }
        
            util.transaction(seqData,memoQuery.getMemosBySeqs)
            .then((ret) =>{
                memos = ret.result
                ret.result = util.makeTree(posts,memos)
                res.send(ret)
            });
        }
        else{   //미처리 게시물 없을시
            res.send(ret)
        }
    })

})



.get("/:postSeq",(req,res)=>{
    const { postSeq } = req.params;
    util.transaction(req,postQuery.getPost)
    .then((ret)=>{
        res.send(ret)
    })
})


.post("/",(req,res)=>{
    util.transaction(req,postQuery.addPostQuery)
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
.patch("/chgPost",(req,res)=>{
    util.transaction(req,postQuery.chgPost)
    .then( (ret) => {
        res.send(ret)
        if(ret.ok == true){
            broadcast(new wsJson("event").event("PATCH","posts",req.body.postSeq,req.body.UID))
        }
    })

})
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
    util.transaction(req,postQuery.removePost)
    .then( (ret)=> {
        res.send(ret)
        if(ret.ok == true){
            broadcast(new wsJson("event").event("DELETE","posts",req.params.postSeq,null,null))
        }
    })

})


//validators
function getPostByMonthValidator(req){
    if(!req?.query){
        return false
    }

    if(!req.query?.fromDate){
        return false
    }

    if(!req.query?.toDate){
        return false
    }

    if(!util.dateCheckYMD(req.query.fromDate) || !util.dateCheckYMD(req.query.toDate)){
        return false
    }
    
    return true;
}



module.exports = router;