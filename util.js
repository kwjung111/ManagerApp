const dbcPool = require("./dbconn.js");
const dbcPoolMonitoring = require("./monitor-targetDBconn.js")
const crypto = require('crypto')
const { wss } = require("./wss.js");
const logger = require("./logger.js")

const util = {
  makeTree: (posts, memos, treeTp) => {
    if (!posts.length) return null;
    if (!memos.length) return posts;
    if(treeTp == 0) {   // SR
      return posts.reduce((acc, cur) => {
        let curPost = util.deepCopy(cur);
        const matchingMemos = memos.filter((memo) => {
          return memo.BRD_SEQ == cur.BRD_SEQ;
        });
        curPost.memos = matchingMemos;
        acc.push(curPost);
        return acc;
      }, []);
    } else if (treeTp == 1) {  // SCHD
      return posts.reduce((acc, cur) => {
        let curPost = util.deepCopy(cur);
        const matchingMemos = memos.filter((memo) => {
          return (memo.SCHD_SEQ == cur.SCHD_SEQ && memo.SCHD_TP == cur.SCHD_TP);
        });
        curPost.memos = matchingMemos;
        acc.push(curPost);
        return acc;
      }, []);
    } else if (treeTp == 2) {  // SCHD - 프로젝트 상세 (프로젝트와 단계 트리)
      return posts.reduce((acc, cur) => {
        let curPost = util.deepCopy(cur);
        const matchingMemos = memos.filter((memo) => {
          return memo.STEP_PRJ_SEQ == cur.PRJ_SEQ;
        });
        curPost.steps = matchingMemos;
        acc.push(curPost);
        return acc;
      }, []);
    } else if (treeTp == 3) {    // SCHD - 전체 직원 스케줄 조회
      return posts.reduce((acc, cur) => {
        let curPost = util.deepCopy(cur);
        const matchingMemos = memos.filter((memo) => {
          return memo.REG_MBR_SEQ == cur.MBR_SEQ;
        });
        if (matchingMemos != null) {
          curPost.schds = matchingMemos;
        }
        acc.push(curPost);
        return acc;
      }, []);
    } else if (treeTp == 4) { // 프로젝트에 단계 붙이기
      return posts.reduce((acc, cur) => {
        let curPost = util.deepCopy(cur);
        const matchingMemos = memos.filter((memo) => {
          return cur.SCHD_TP == '1' && cur.SCHD_SEQ == memo.PRJ_SEQ;
        });
        if (matchingMemos != null) {
          curPost.steps = matchingMemos;
        }
        acc.push(curPost);
        return acc;
      }, []);
    }
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
      return {...req.params,...req.query, ...req.body}
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

  transactionV2: async(query,data) => {
    let conn = null;
    let res = {}
    try{
      conn = await dbcPool.getConnection();
      await conn.beginTransaction();
    
      const [result] = await conn.query(query, data)
      await conn.commit();

      res.ok = true;
      res.result = result


    } catch(err) {
      logger.error('Query error', {message:err})
      
      if(conn){
        await conn.rollback();
      }

      res.ok = false;
      res.result = null;

    } finally{
      if(conn){
        conn.release()
      }
    }
    return res
  },

  transactionsV2: async (queries, data, isAsync = false) => {
    let conn = null;
    let res = {}

    try {
      conn = await dbcPool.getConnection();
      await conn.beginTransaction();

      let results;

      if (isAsync) {
        results = await Promise.all(
          queries.map(async (query) => { 
            let [res] = await conn.query(query,data)
            return res;
          })
        );
      } else {
        results = [];
        for (let qry of queries) {
          let [result] = await conn.query(qry,data);
          data[qry.name] = result;
          results.push(result);
        }
      }

      await conn.commit();
      
      res.ok = true;
      res.result = results;
    } catch (err) {

      logger.error(`Transaction Error : ${err}`);

      if (conn) {
        await conn.rollback();
        logger.info('transaction rollbacked')
      }
      res.ok = false;
      res.results = null;
    } finally {
      if(conn){
        conn.release();
      }
    }
    return res
  },


  transaction_Monitoring: async(query,data) => {
    let conn = null;
    let res = {}
    try{
      conn = await dbcPoolMonitoring.getConnection();
      await conn.beginTransaction();
    
      const [result] = await conn.query(query, data)
      await conn.commit();

      res.ok = true;
      res.result = result


    } catch(err) {
      logger.error(`Transaction Error : ${err}`);
      
      if(conn){
        try{
        await conn.rollback();
        }
        catch(rollbackErr){
          logger.error(`Rollback error : ${rollbackErr}`)
        }
      }

      res.ok = false;
      res.result = null;

    } finally{
      if(conn){
        conn.release();
      }
    }
    return res
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

      rt.ok = true;
      rt.msg = "request success";
      rt.statusCode = 200;
      rt.result = result;

    } catch (err) {
      logger.error(`Transaction Error : ${err}`);
      rt.msg = "Internal Server Error";
      rt.statusCode = 500;
      rt.result = err.message;

      if (conn) {
        await conn.rollback();
        logger.info('transaction rollbacked')
      }
    }finally{
      if(conn){
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

      if (isAsync) {
        results = await Promise.all(
          queries.map(async (query) => { 
            let [res] = await conn.query(query(data))
            return res;
          })
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
      
      rt.ok = true;
      rt.msg = "request success";
      rt.statusCode = "200";
      rt.result = results;
    } catch (err) {

      logger.error(`Transaction Error : ${err}`);
      rt.msg = "Internal Server Error";
      rt.result = err.message;

      if (conn) {
        await conn.rollback();
        logger.info('transaction rollbacked')
      }
    } finally {
      if(conn){
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
  //날짜 유효성 검사
  dateCheckYMD : (date) =>{
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  
  // 정규식과 문자열을 비교하여 유효성 검사
  if (!regex.test(date)) {
    return false;
  }

  // 날짜를 파싱하고 유효한 날짜인지 확인
  let parts = date.split("-");
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  let day = parseInt(parts[2], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  if (month === 2) {
    // 2월인 경우 윤년을 고려하여 날짜 확인
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      return day <= 29;
    } else {
      return day <= 28;
    }
  }

  // 4, 6, 9, 11월은 30일까지 있음
  if ([4, 6, 9, 11].includes(month)) {
    return day <= 30;
  }

  return true;
},
getLastDays(startDateStr,daysAgo){
  let year = parseInt(startDateStr.substring(0,4));
  let month = parseInt(startDateStr.substring(4,6)) -1; // 0부터 시작
  let day = parseInt(startDateStr.substring(6,8));
  let startDate = new Date(year,month,day)

  let dateArr = [];

  for( let i = 0; i <= daysAgo;i++){
    let curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() - i);

    let formattedDate = curDate.getFullYear().toString() +
                        ('0' + (curDate.getMonth() + 1)).slice(-2) +
                        ('0' + curDate.getDate()).slice(-2);

    dateArr.push(formattedDate);
  }
  return dateArr
},
  

};

module.exports = util;
