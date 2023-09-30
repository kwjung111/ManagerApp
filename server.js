const express = require('express');
const session = require('express-session')
const https = require('https');
const fs = require('fs');

const compression = require('compression') //텍스트 압축
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const cors = require('cors')
require("dotenv").config();
const env = process.env.NODE_ENV;
const http = require('http')
const {wss,wsJson,initWss,broadcast} = require('./wss.js')

const { v4:uuidv4} = require('uuid')
const util = require('./util.js')

const path=require('path')
const app = express();

//개발계 https 사용을 위한 설정
let server
let httpsOptions
if(env == "DEV"){
    httpsOptions = {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem')
  };
  server = https.createServer(httpsOptions,app);
}else if(env=="PRD"){
    server = http.createServer(app);
}

const port = process.env.PORT || 3000;

//router
const postsRouter = require('./routes/posts.js')
const memosRouter = require('./routes/memos.js')
const sessionRouter = require('./routes/session.js')
const cmmnRouter = require('./routes/cmmn.js')
const authRouter = require('./routes/auth.js')
const { swaggerUi, specs } = require('./swagger');

//CORS 허용
app.use(cors({
    origin:true,
    credentials:true,
}))

app.use(express.json())    //순서 최상위
app.use(cookieParser());    //순서 최상위

//텍스트 압축 관련 코드
app.use(compression({filter: shouldCompress}))

function shouldCompress(req, res){
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }
  
    // fallback to standard filter function
    return compression.filter(req, res)
  }
    
//서버,웹소켓 초기화
server.listen(port, ()=>{
    console.log(`${env} server is listening at localhost:${port}`);
});
initWss(server);

//정적 리소스 라우팅
app.use(express.static(path.resolve(__dirname, 'dist')));
app.use('/srList', express.static(path.join(__dirname, 'dist')));


//권한 필요없는 요청
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/auth',authRouter)
app.use(verifyToken);

//권한 필요한 요청
app.use('/posts',postsRouter)
app.use('/memos',memosRouter)
app.use('/session',sessionRouter)
app.use('/cmmn',cmmnRouter)

//TODO 세션 구현시 삭제
app.get('/identifier',(req,res)=>{
    const uniqueKey = uuidv4();
    res.send(uniqueKey);
})

//미들웨어 Access Token 검증 코드
function verifyToken(req,res,next){
    const token = req.headers.authorization;

    if(!token){
        return res.status(403).json({message:'토큰 없음'})
    }

    jwt.verify(token,'prvkey',(err, decoded) => {
        if(err){
            console.log(token)
            console.log(err)
            return res.status(500).json({message:'Access Token 검증 실패'})
        }

        req.body.userData = decoded;     
        next();
    })
}


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