const express = require("express");
const router = express.Router();
const util = require("../util.js");
const authQuery = require("../queries/authQuery.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const logger = require('../logger.js');
const { strict } = require("assert");

const prvKey = process.env.PRV_KEY;

const mailTransporter = nodemailer.createTransport({
  service: "gmail", // 메일 보내는 곳
  port: 587,
  host: "smtp.gmlail.com",
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.MAIL_SENDER, // 보내는 메일의 주소
    pass: process.env.MAIL_PASS, // 보내는 메일의 비밀번호
  },
});

const mailSender = {
  sendMail: async function (param) {
    // 메일 옵션
    let mailOptions = {
      from: process.env.MAIL_SENDER, // 보내는 메일의 주소
      to: param.toEmail, // 수신할 이메일
      subject: param.subject, // 메일 제목
      text: param.text || null, // 메일 내용
      html: param.html || null,
    };
    // 메일 발송
    const result = await mailTransporter.sendMail(mailOptions);
    logger.info('SignUpMailSend',{message:result})
    return result;
  },
};

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
      if (saltedPwd == chkRst.PWD) {
        //인증 여부 확인
        if (chkRst.ROLE == "PENDING") {
          ret.result = {
            code: "03",
            status: "failed",
          };
          ret.message = "not authorized yet";
          res.send(ret);
          return;
        }

        const payload = {
          id: chkRst.ID,
          name : chkRst.NAME,
          seq: chkRst.SEQ,
          role: chkRst.ROLE,
        };
        const token = jwt.sign(payload, prvKey, { expiresIn: "24h" }); //jwt 토큰 쿠키로 전달
        res.cookie("jwt", token, {
          maxAge: 86400000, //24*60*60*1000, ms 단위
          //httpOnly:true,  TODO true 처리하기
          sameSite:'lax',
          secure:true,
        });
        ret.result = {
          code: "00",
          status: "success",
          userData: payload
        };
        ret.message = "Auth success";
        res.send(ret);
        return;
      } else {
        //비밀번호 오류
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
  .get("/logout", (req, res) => {
    let rt = {
      ok: true,
      result: {},
      message: "logout success",
    };
    res.clearCookie("jwt");
    res.send(rt);
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

    .get("/checkNm/:name", (req, res) => {
      const { name } = req.params;
      util.transaction(req, authQuery.checkName)
          .then((ret) => {
            let [chkRst] = ret.result;
            if(chkRst) {
              ret.result = true;
            } else {
              ret.result = false;
            }
            res.send(ret);
          })
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
      rt.result.code = "01";
      rt.result.status = "no token";
      rt.result.message = "Token 없음";
      res.send(rt);
    } else {
      jwt.verify(token, prvKey, (err, decoded) => {
        if (err) {
          logger.error('chkToken',{message:err});
          (rt.ok = false), (rt.result.code = "02");
          rt.result.status = "err";
          rt.message = "Access Token 검증 실패";
        } else {
          (rt.ok = true), (rt.result.code = "00");
          (rt.result.status = "success"),
            (rt.message = "Access Token 확인완료");
        }
        res.send(rt);
      });
    }
  })
  //회원가입 관련 코드들
  .post("/signUp", async (req, res) => {
    //TODO id, 비밀번호 값 validation 코드 작성
    let validator = signUpValidator(req);
    if (!validator.ok) {
      res.send(validator);
      return;
    }
    const salted = await createHashedPassword(req.body.pwd);
    req.body.pwd = salted.pwd;
    req.body.salt = salted.salt;
    util.transaction(req, authQuery.signUp).then((ret) => {
      res.send(ret);
    });
  })

  .post("/sendMailForSignUp", async (req, res) => {
    try {
      const token = jwt.sign({ id: req.body.id }, "emailAuth", {
        expiresIn: "3m",
      }); //이메일 인증 prvkey 하드코딩

      let url = null;

      if(process.env.NODE_ENV === "DEV"){       //주소 하드코딩 주의!!
        url = "https://localhost:3000"
      }else if(process.env.NODE_ENV === "PRD"){
        url = "https://intra2.tomato-pos.com"   
      }

      mailSender.sendMail({
        toEmail: `${req.body.email}@businessinsight.co.kr`, // 수신할 이메일
        subject: "[SRSYSTEM] 회원가입 관련 이메일입니다.", // 메일 제목
        html: `
        <p>${req.body.id}님의 계정 인증을 위해 링크를 클릭해 주세요.</p>
        <a href="${url}/auth/authForSignUp/${token}">인증하기</a>`, // 메일 내용, 현재 url 하드코딩
      });
    } catch (e) {
      logger.error('sendmailError',{message:e});
      res.send("error")
      return;
    }
    res.send("success")
  })

  .get("/authForSignUp/:token", async (req, res) => {
    let { token } = req.params;
    if (!token) {
      res.send("인증 실패! 토큰이 없습니다.");
      return;
    }

    jwt.verify(token, "emailAuth", (err, decoded) => {
      if (err) {
        logger.error('authForSignUp',{message:err})
        res.send("유효하지 않은 토큰이거나 만료된 토큰입니다.");
        return;
      } else {
        req.params.id = decoded.id;
        util.transaction(req, authQuery.signUpCheck).then((ret) => {
          if (ret.statusCode == 200) {
            res.send("인증 성공! 이제 돌아가서 로그인 해 주세요");
          } else {
            res.send("인증 실패! 토큰이 유효하지 않습니다.");
          }
        });
      }
    });
  });

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

function signUpValidator(req) {
  let rt = {
    ok: true,
    result: {},
    msg: "",
  };
  if (!req.body?.id || !req.body?.pwd || !req.body?.name || !req.body?.email) {
    rt.ok = false;
    rt.msg = "null filed exists";
    return rt;
  }
  if (req.body?.id.length < 5) {
    rt.ok = false;
    rt.msg = "id not validate";
    return rt;
  }
  if (req.body?.pwd.length < 5) {
    rt.ok = false;
    rt.msg = "pwd not validate";
    return rt;
  }
  //TODO validation 코드 작성...
  //todo 정규식 이메일 관련
  return rt;
}


module.exports = router;
