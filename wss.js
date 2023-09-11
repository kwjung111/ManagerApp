const WebSocket = require('ws');

let wss;

initWss = (server) =>{
    wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws,request) => {
        console.log('Client connected');
    
        ws.on('message', (message) => {
            console.log(`Received message: ${message}`);
        });
    
        ws.send(new wsJson({
                content: `you are connected to server`,
                clients : wss.clients.size,
            }).message())
    });
}

//웹소켓 json 메세지 파싱
class wsJson{
    #json={
        type:null,
        data:null,
    }
    constructor(data){
        this.#json.data = data
    }
    event(){
        this.#json.type = "event"
        return JSON.stringify(this.#json)
    }
    message(data){
        this.#json.type = "message"
        return JSON.stringify(this.#json)
    }
}

//전체 메세지 전달
broadcast = (msg) => {
    wss.clients.forEach((client) => {
            client.send(msg);
    });
}

module.exports = {wss, initWss, wsJson, broadcast};