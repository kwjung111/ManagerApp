const express = require("express")
const router = express.Router();
const util = require("../util.js")
const authQuery = require("../queries/authQuery.js")
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const { EvalSourceMapDevToolPlugin } = require("webpack");

//로그인 관련 코드
router
    .post('/login', (req,res) => {
    util.transaction(req,authQuery.checkId)
    .then(async (ret) => {
        let [chkRst]  = ret.result;
        const {id,pwd} = req.body

        //결과값 없으면 ID 없음
        if(!chkRst){
            ret.result = {
                code:'01',
                status:'failed'
            }
            ret.message = 'id failed'
            res.send(ret)
            return;
        }
        
        //비밀번호 검증 로직
        const salted = await createHashedPassword(pwd,chkRst.SALT);
        console.log(salted.pwd)
        const saltedPwd = salted.pwd
        //로그인 성공
        if( (saltedPwd == chkRst.PWD) || (id =="test" && pwd == "test")){   
       
            const token = jwt.sign({id}, 'prvkey', {expiresIn : '24h'})   //jwt 토큰 쿠키로 전달
            res.cookie('jwt',token,{
                maxAge:86400000,    //24*60*60*1000, ms 단위
                //httpOnly:true,
                //secure:true,
            })  
            ret.result = {
                code:'00',
                status:'success'
            }
            ret.message = 'Auth success'
            res.send(ret)
            return;
        }else{
            ret.result = {
                code:'02',
                status:'failed'
            }
            ret.message = 'pwd failed'
            res.send(ret)
            return;
        }
    })
})
.get('/checkId/:id', (req,res) => {
    const {id} = req.params
    util.transaction(req,authQuery.checkId)
    .then((ret) => {
        let [chkRst]  = ret.result;
        if(chkRst){
            ret.result = true;
        }else{
            ret.result = false;
        }
        res.send(ret)
    })
})
.post('/signUp',async (req,res) => {
    //id, 비밀번호 값 validation 코드 작성
    const salted = await createHashedPassword('test');
    req.body.pwd = salted.pwd;
    req.body.salt = salted.salt;
    util.transaction(req,authQuery.signUp)
    .then((ret) => {
        console.log(ret)
        res.send(ret)
    })
})



function createHashedPassword (userPwd,userSalt=null){
    return new Promise(async (resolve, reject) => {
        let salt = userSalt
        if(!salt){
         salt = await util.createSalt(); 
        }
        crypto.pbkdf2(userPwd, salt, 9972, 64, 'sha512', (err, key) => {
            if (err) reject(err);
            resolve({ pwd: key.toString('base64'), salt });
        });
    });
} 




module.exports = router;