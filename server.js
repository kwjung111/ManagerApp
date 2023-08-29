const express = require('express');
require("dotenv").config();
const http = require('http')
const WebSocket = require('ws');
const dbconn = require('./dbconn.js')

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3000;


app.use("/", (req, res)=>{
    res.send('success')
})



server.listen(port, ()=>{
    console.log(`server is listening at localhost:${port}`);
});// http + ws 서버 설정


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