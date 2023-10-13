const query = require("./queries/query.js");
const dbcPool = require("./dbconn.js");
const crypto = require('crypto')
const { wss } = require("./wss.js");
const logger = require("./logger.js")

const util = {
  makeTree: (posts, memos) => {
    if (!posts.length) return null;
    if (!memos.length) return posts;
    return posts.reduce((acc, cur) => {
      let curPost = util.deepCopy(cur);
      const matchingMemos = memos.filter((memo) => {
        return memo.BRD_SEQ == cur.BRD_SEQ;
      });
      curPost.memos = matchingMemos;
      acc.push(curPost);
      return acc;
    }, []);
  },

  //Todo 배열의 경우 처리 못함, 순환 참조 처리 불가
  deepCopy: (obj) => {
    if (obj === null || typeof obj !== "object") return obj;

    let copy = {};
    for (let key in obj) {
      copy[key] = util.deepCopy(obj[key]);
    }
    return copy;
  },

  //data의 Body, 경로 변수를 Object 형태로 반환
  parseReqBody: (req) => {
    if (req.method == "GET") {
      return {...req.params,...req.query}
    } else if (req.method == "POST") {
      return req.body;
    } else if (req.method == "DELETE") {
      return req.params;
    } else if (req.method == "PATCH") {
      return req.body;
    } else if (req.method == "SERVICE"){    //서비스 내에서 만든 데이터
      return req.data;
    }
  },

  transaction: async (req, queries) => {
    let rt = {
      ok: false,  
      msg: "",
      statusCode : 500,
      result: null,
    };
    let data = util.parseReqBody(req);
    let conn = null;
    try {
      conn = await dbcPool.getConnection();
      await conn.beginTransaction();

      const [result] = await conn.query(queries(data));
      await conn.commit();
      conn.release();
      rt.ok = true;
      rt.msg = "request success";
      rt.statusCode = 200;
      rt.result = result;
    } catch (err) {
      logger.error('Transaction Error',{message:err});
      rt.msg = "Internal Server Error";
      rt.statusCode = 500;
      rt.result = err.message;
      if (conn) {
        await conn.rollback();
        conn.release();
      }
    }
    return rt;
  },

  transactions: async (req, queries, isAsync = false) => {
    let rt = {
      ok: false,
      msg: "",
      statusCode : 500,
      result: null,
    };
    let data = util.parseReqBody(req);
    let conn = null;

    try {
      conn = await dbcPool.getConnection();
      await conn.beginTransaction();

      let results;

      if (isAsync == true) {
        results = await Promise.all(
          queries.map((query) => conn.query(query(data)).then(([res]) => res))
        );
      } else {
        results = [];
        for (let qry of queries) {
          let [result] = await conn.query(qry(data));
          data[qry.name] = result;
          results.push(result);
        }
      }
      await conn.commit();
      conn.release();
      rt.ok = true;
      rt.msg = "request success";
      rt.statusCode = "200";
      rt.result = results;
    } catch (err) {
      logger.error('Transaction Error',{message:err});
      rt.msg = "Internal Server Error";
      rt.result = err.message;
      if (conn) {
        await conn.rollback();
        conn.release();
      }
    }
    return rt;
  },
  //salt 생성하는 비동기 함수
  createSalt: () =>
    new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString('base64'));
        });
    }),
  dateCheckYMD : (date) =>{
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date)
  }

  

};

module.exports = util;
