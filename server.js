const express = require('express');
const session = require('express-session')
const cors = require('cors')
require("dotenv").config();
const http = require('http')
const {wss,wsJson,initWss,broadcast} = require('./wss.js')

const { v4:uuidv4} = require('uuid')
const query = require('./queries/query.js')
const util = require('./util.js')

const path=require('path')
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

//router
const postsRouter = require('./routes/posts.js')
const memosRouter = require('./routes/memos.js')
const sessionRouter = require('./routes/session.js')
const cmmnRouter = require('./routes/cmmn.js')

//CORS 허용
app.use(cors())
app.use(express.json()) 

//TODO 세션 작성
/*
app.use(session({
    secret:'kwjung',
    resave:false,
    saveUninitialized:true,
    cookie: {
        secure : true,
        maxAge : 600000,     //10분   
    }
}))
*/


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
app.use('/session',sessionRouter)
app.use('/cmmn',cmmnRouter)

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

    util.transactions(req,[query.getPosts,query.getMemos],true)
    .then((ret) => {
        let posts = ret.result[0]
        let memos = ret.result[1]

        console.log(memos)
        
        rt.ok = true
        rt.msg = 200
        rt.result = util.makeTree(posts,memos)
        res.send(rt)
    })
})




//TODO 세션 구현시 삭제

app.get('/identifier',(req,res)=>{
    const uniqueKey = uuidv4();
    res.send(uniqueKey);
})


//웹푸시 코드
/*
const webPush = require('web-push')
const bodyParser = require('body-parser')

webPush.setVapidDetails(
    'mailto:kwjung@businessinsignt.co.kr'
    ,process.env.VAPID_PUB
    ,process.env.VAPID_PRV)


let subscriptions = []  

 웹 푸시 코드
webPush.sendNotification(
    subscription,
    JSON.stringify({
        title: 'Web Push | Getting Started',
        body: message || '(Empty message)',
      }));
      */

//sse 코드
/*
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    setInterval(() => {
      res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);
    }, 1000);
  });
  */