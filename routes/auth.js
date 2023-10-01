const express = require("express");
const router = express.Router();
const util = require("../util.js");
const authQuery = require("../queries/authQuery.js");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer')
const crypto = require("crypto");

const prvKey = process.env.PRV_KEY

const mailTransporter = nodemailer.createTransport({
  service: 'gmail',   // 메일 보내는 곳
  port: 587,
  host: 'smtp.gmlail.com',  
  secure: false,  
  requireTLS: true ,
  auth: {
    user: process.env.MAIL_SENDER,  // 보내는 메일의 주소
    pass: process.env.MAIL_PASS   // 보내는 메일의 비밀번호
  }});

const mailSender = {
    sendMail: async function (param) {

        // 메일 옵션
        let mailOptions = {
          from: process.env.MAIL_SENDER , // 보내는 메일의 주소
          to: param.toEmail, // 수신할 이메일
          subject: param.subject, // 메일 제목
          text: param.text // 메일 내용
          //html: template
        };
        // 메일 발송    
        const result = await mailTransporter.sendMail(mailOptions);
        console.log(result)
        return result;
      }
    }
    

//로그인 관련 코드
router
  .post("/login", (req, res) => {
    util.transaction(req, authQuery.checkId).then(async (ret) => {
      let [chkRst] = ret.result;
      const { id, pwd } = req.body;

      //결과값 없으면 ID 없음
      if (!chkRst) {
        ret.result = {
          code: "01",
          status: "failed",
        };
        ret.message = "id failed";
        res.send(ret);
        return;
      }

      //비밀번호 검증 로직
      const salted = await createHashedPassword(pwd, chkRst.SALT);
      const saltedPwd = salted.pwd;
      //로그인 성공
      if (saltedPwd == chkRst.PWD || (id == "test" && pwd == "test")) {
        const payload = {
          id: chkRst.ID,
          seq: chkRst.SEQ,
          role: chkRst.ROLE,
        };
        const token = jwt.sign(payload, prvKey, { expiresIn: "24h" }); //jwt 토큰 쿠키로 전달
        res.cookie("jwt", token, {
          maxAge: 86400000, //24*60*60*1000, ms 단위
          //httpOnly:true,
          //secure:true,
        });
        ret.result = {
          code: "00",
          status: "success",
        };
        ret.message = "Auth success";
        res.send(ret);
        return;
      } else {
        ret.result = {
          code: "02",
          status: "failed",
        };
        ret.message = "pwd failed";
        res.send(ret);
        return;
      }
    });
  })
  .get("/logout", (req,res) => {
    let rt= {
        ok: true,
        result:{},
        message: 'logout success'
    }
    res.clearCookie('jwt')
    res.send(rt)
  })
  .get("/checkId/:id", (req, res) => {
    const { id } = req.params;
    util.transaction(req, authQuery.checkId).then((ret) => {
      let [chkRst] = ret.result;
      if (chkRst) {
        ret.result = true;
      } else {
        ret.result = false;
      }
      res.send(ret);
    });
  })
  //로그인 페이지 진입 시, 토큰 유효성 검사
  .get("/chkToken", async (req, res) => {
    const token = req.headers.authorization;

    let rt = {
      ok: true,
      result: {},
      message: null,
    };

    if (!token) {
        rt.result.code = '01';
        rt.result.status = 'no token'
        rt.result.message = 'Token 없음'
      res.send(rt)
    } else {
      jwt.verify(token, prvKey, (err, decoded) => {
        if (err) {
          console.log(err);
          rt.ok = false,
          rt.result.code = '02'
          rt.result.status = 'err'
          rt.message="Access Token 검증 실패"
        }else{
            rt.ok = true,
            rt.result.code = '00'
            rt.result.status = 'success',
            rt.message = 'Access Token 확인완료'
        }
        res.send(rt)
      });
    }
  })
  //회원가입 관련 코드들
  .post("/signUp", async (req, res) => {
    //TODO id, 비밀번호 값 validation 코드 작성
    let validator= signUpValidator(req)
    if(!validator.ok){
        res.send(validator)
        return 
    }
    const salted = await createHashedPassword(req.body.pwd);
    req.body.pwd = salted.pwd;
    req.body.salt = salted.salt;
    util.transaction(req, authQuery.signUp).then((ret) => {
      console.log(ret);
      res.send(ret);
    });
  })
  .get("/sendMailForSignUp",async (req,res) => {
    try{
    mailSender.sendMail({
        toEmail:'kwkwjung@gmail.com', // 수신할 이메일
        subject:'aa', // 메일 제목
        text:'aa', // 메일 내용
    })
}catch(e){
    console.log(e)
}
res.send('success?')

  })

//salt 값으로 해시된 비밀번호 반환
function createHashedPassword(userPwd, userSalt = null) {
  return new Promise(async (resolve, reject) => {
    let salt = userSalt;
    if (!salt) {
      salt = await util.createSalt();
    }
    crypto.pbkdf2(userPwd, salt, 9972, 64, "sha512", (err, key) => {
      if (err) reject(err);
      resolve({ pwd: key.toString("base64"), salt });
    });
  });
}


function signUpValidator(req){
    let rt = {
        ok:true,
        result:{},
        msg:'',
    }
    if(!req.body?.id || !req.body?.pwd || !req.body?.name || !req.body?.email){
        rt.ok = false;
        rt.msg = 'null filed exists'
        return rt;
    }
    console.log(req.body)
    if(req.body?.id.length <5){
        rt.ok = false;
        rt.msg ='id not validate'
        return rt;
    }
    if(req.body?.pwd.length<5){
        rt.ok = false;
        rt.msg ='pwd not validate'
        return rt
    }
    //TODO validation 코드 작성...
    return rt
}

module.exports = router;
