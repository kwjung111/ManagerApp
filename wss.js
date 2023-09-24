const WebSocket = require('ws');

let wss;

initWss = (server) =>{
    wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws,request) => {
        console.log('Client connected');
    
        ws.on('message', (message) => {
            console.log(`Received message: ${message}`);
        });
    
        ws.send(new wsJson('message').message('you are connected to Server'))
    });
}

//웹소켓 json 메세지 파싱
class wsJson{
    
    constructor(type){
        this.json ={
            type:null,
            data:null,
        }
        this.json.type = type
    }
    event(method,resource,rid,uid,content,meta=null){
        if(this.json.type !== "event"){
            throw new Error('이벤트 타입이 아님')
        }
        console.log(meta)
        this.json.data = {
            method:method,
            resource:resource,
            rid:rid,        //자원 id
            UID:uid,        //유저 id
            content:content,
            meta:meta
        }
        return JSON.stringify(this.json)
    }
    message(msg){
        if(this.json.type !== "message"){
            throw new Error('메세지 타입이 아님')
        }
        this.json.data = msg
        return JSON.stringify(this.json)
    }
}


//전체 메세지 전달
broadcast = (msg) => {
    wss.clients.forEach((client) => {
            client.send(msg);
    });
}

module.exports = {wss, initWss, wsJson, broadcast};