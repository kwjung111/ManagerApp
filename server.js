const express = require('express');
const cors = require('cors')
require("dotenv").config();
const http = require('http')
const {wss,wsJson,initWss,broadcast} = require('./wss.js')
const query = require('./query.js')
const util = require('./util.js')

const path=require('path')
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

//router
const postsRouter = require('./routes/posts.js')
const memosRouter = require('./routes/memos.js')

//CORS 허용
app.use(cors())
app.use(express.json())

//서버,웹소켓 초기화
server.listen(port, ()=>{
    console.log(`server is listening at localhost:${port}`);
});
initWss(server);

//정적 리소스 라우팅
app.use(express.static(path.resolve(__dirname, 'dist')));
app.use('/srList', express.static(path.join(__dirname, 'dist')));

//라우터
app.use('/posts',postsRouter)
app.use('/memos',memosRouter)



app.get("/postsCount",(req,res)=>{
    util.transaction(req,query.getPostsCount)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
    })
})


//TODO 리팩토링
app.get('/postTree',async (req,res) =>{

    let rt = {
        ok : false,
        msg : '',
        result : null
    }

    Promise.all([
        util.transaction(req,query.getPosts),
        util.transaction(req,query.getMemos)
    ]).then((results) => {
        let posts = results[0].result
        let memos = results[1].result
        
        rt.ok = true
        rt.msg = 200
        rt.result = util.makeTree(posts,memos)
        res.send(rt)
    })
})


//TODO URL 바꾸기 - POSTS 
app.post('/changePrgState',(req,res)=>{
    util.transaction(req,query.changePrgState)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        broadcast(new wsJson({
            event:"changePrgState"
        }).event())
    })
})
