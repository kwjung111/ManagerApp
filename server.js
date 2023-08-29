const express = require('express');
const http = require('http')
const WebSocket = require('ws');

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

    ws.send('Hello from server!');
});