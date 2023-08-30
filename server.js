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

    setTimeout(()=>{
        ws.send('event!!')
    },5000)
    ws.send('Hello from server!');
});

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
})

app.post("/remove",(req,res)=>{
    if(req.body){
        res.sendStatus(200)
    }
    else{
        res.sendStatus(400)
    }
})

app.get("/postsCount",(req,res)=>{
    const postsCountQuery = query.getPostsCount()
    dbconn.query(postsCountQuery,(error,results,fields) =>{
        console.log(JSON.stringify(results))
        res.json(results[0])
    })
    console.log(postsCountQuery)
   
    
})


app.get('/sendRefreshEvt', (req, res) => {
    // 모든 클라이언트에게 메시지 
    console.log('aa')
    wss.clients.forEach(client => {
        console.log(client)
        if (client.readyState === WebSocket.OPEN) {
            console.log(client)
            client.send('Hello, World!');
        }
    });
    res.send('Event sent to all clients.');
});

server.listen(port, ()=>{
    console.log(`server is listening at localhost:${port}`);
});// http + ws 서버 설정



