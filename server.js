const express = require("express");
const compression = require("compression"); //텍스트 압축
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const env = process.env.NODE_ENV;
const http = require("http");
const { initWss } = require("./wss.js");

const path = require("path");
const app = express();

//개발계 https 사용을 위한 설정
let server;
if (env == "DEV") {
  const fs = require("fs");
  const https = require("https");

  const httpsOptions = {
    key: fs.readFileSync("./certs/localhost-key.pem"),
    cert: fs.readFileSync("./certs/localhost.pem"),
  };
  server = https.createServer(httpsOptions, app);
} else if (env == "PRD") {
  server = http.createServer(app);
}

const port = process.env.PORT || 3000;

//router
const postsRouter = require("./routes/posts.js");
const memosRouter = require("./routes/memos.js");
const cmmnRouter = require("./routes/cmmn.js");
const authRouter = require("./routes/auth.js");

//정적 리소스 라우팅
app.use(express.static(path.resolve(__dirname, "dist")));

//CORS 허용
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json()); //순서 최상위

//텍스트 압축 관련 코드
app.use(compression({ filter: shouldCompress }));

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

//서버,웹소켓 초기화
server.listen(port, () => {
  console.log(`${env} server is listening at localhost:${port}`);
});
initWss(server);

//권한 필요없는 요청
if (env == "DEV") {
  const testRouter = require("./routes/test.js");
  app.use("/test", testRouter);
}
  app.use("/auth", authRouter);
app.use(verifyToken);

//권한 필요한 요청
app.use("/posts", postsRouter);
app.use("/memos", memosRouter);
app.use("/cmmn", cmmnRouter);


//TODO uuid -> jwt 기반으로 리팩토링하기
app.get('/identifier',(req,res)=>{
  const uniqueKey = uuidv4();
  res.send(uniqueKey);
})

//미들웨어 Access Token 검증 코드

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: "토큰 없음" });
  }

  jwt.verify(token, process.env.PRV_KEY, (err, decoded) => {
    if (err) {
      console.log(token);
      console.log(err);
      return res.status(500).json({ message: "Access Token 검증 실패" });
    } else {
      req.body.userData = decoded;
      next();
    }
  });
}

