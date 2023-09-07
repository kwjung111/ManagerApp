const express = require('express');
const cors = require('cors')
require("dotenv").config();
const http = require('http')
const WebSocket = require('ws');
const dbcPool = require('./dbconn.js')
const query = require('./query.js')
const util = require('./util.js')

const path=require('path')
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3000;


app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'dist')));

app.use('/srList', express.static(path.join(__dirname, 'dist')));



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

//모든 클라이언트에게 메세지 전송
wss.broadcast = (msg) => {
    wss.clients.forEach((client) => {
        client.send(msg);
    });
}


app.post("/add",(req,res)=>{
    transaction(req,query.addPostQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        wss.broadcast(new wsJson({
            event:"addPost"
        }).event())
    })
})

app.post("/addMemo",(req,res)=>{
    transaction(req,query.addMemoQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        wss.broadcast(new wsJson({
            event:"addMemo"
        }).event())
    })
})

app.post("/remove",async (req,res)=>{
    transaction(req,query.removePostQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        wss.broadcast(new wsJson({
            event:"removePost"
        }).event())
    })
})

app.post("/removeMemo", async (req,res)=>{
    transaction(req,query.removeMemoQuery)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        wss.broadcast(new wsJson({
            event:"removeMemo"
        }).event())
    })
})

app.get("/postsCount",(req,res)=>{
    transaction(req,query.getPostsCount)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
    })
})

app.get('/posts',(req,res)=>{
    transaction(req,query.getPosts)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
    })
})

app.get('/memos',(req,res)=>{
    transaction(req,query.getMemos)
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
        transaction(req,query.getPosts),
        transaction(req,query.getMemos)
    ]).then((results) => {
        let posts = results[0].result
        let memos = results[1].result
        
        rt.ok = true
        rt.msg = 200
        rt.result = util.makeTree(posts,memos)
        res.send(rt)
    })
})

app.post('/changePrgState',(req,res)=>{
    transaction(req,query.changePrgState)
    .then( (ret)=> {
        res.send(ret)
        console.log(ret)
        wss.broadcast(new wsJson({
            event:"changePrgState"
        }).event())
    })
})


server.listen(port, ()=>{
    console.log(`server is listening at localhost:${port}`);
});// http + ws 서버 설정


//트랜잭션 구현
async function transaction(req,query){
    let rt = {
        ok : false,
        msg : '',
        result : null
    }
    let data = req.body
    let conn = null

    try{
        conn = await dbcPool.getConnection()
        await conn.beginTransaction()
        const [result] = await conn.query(query(data))
        rt.ok = true
        rt.msg = '200',
        rt.result = result;
        await conn.commit(); 
        conn.release()
    }
    catch(err){
        console.error(err);
        rt.msg = '400'
        rt.result = err.message
        if(conn){
            await conn.rollback()
            conn.release()
        }
    }
    return rt

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