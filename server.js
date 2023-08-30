const express = require('express');
require("dotenv").config();
const http = require('http')
const WebSocket = require('ws');
const dbconn = require('./dbconn.js')
const query = require('./query.js')

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3000;



app.use(express.json())

wss.on('connection', (ws,request) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });

    ws.send('connected');
});

//모든 클라이언트에게 메세지 전송
wss.broadcast = (msg) => {
    wss.clients.forEach((client) => {
        client.send(msg);
    });
}


//TODO 쿼리, db커넥션 promise 기반으로 교체
app.post("/add",(req,res)=>{
    if(req.body){
        const data = req.body
        const addQuery = query.addPostQuery(data.content,data.writer)
        dbconn.query(addQuery,(error,results,fields) =>{
            console.log('result :'+ JSON.stringify(results))
        })
        console.log(addQuery)
        res.sendStatus(200)
    }
    else{
        res.sendStatus(400)
    }
    wss.broadcast('add')
})

app.post("/remove",(req,res)=>{
    if(req.body){
        res.sendStatus(200)
    }
    else{
        res.sendStatus(400)
    }
    wss.broadcast('remove')
})

app.get("/postsCount",(req,res)=>{
    const postsCountQuery = query.getPostsCount()
    data = dbconn.query(postsCountQuery,(error,results,fields) =>{
        console.log(JSON.stringify(results))
        res.json(results[0])
    })
    console.log(postsCountQuery)
})

app.get('/posts',(req,res)=>{
    const postQuery = query.getPosts()
    dbconn.query(postQuery,(error,results,fields) =>{
        console.log(JSON.stringify(results))
        res.json(results)
    })
    console.log(postQuery)
})

app.get('/memos',(req,res)=>{
    const memoQuery = query.getMemos()
    dbconn.query(memoQuery,(error,results,fields) =>{
        console.log(JSON.stringify(results))
        res.json(results)
    })
    console.log(memoQuery)
})


server.listen(port, ()=>{
    console.log(`server is listening at localhost:${port}`);
});// http + ws 서버 설정



