const query = require('./query.js')
const dbcPool = require('./dbconn.js')
const {wss} = require('./wss.js')

const util = {
  makeTree: (posts, memos) => {
    if(!posts.length) return null
    if(!memos.length) return posts 
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
  
  deepCopy: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    let copy = {};
    for (let key in obj) {
      copy[key] = util.deepCopy(obj[key]);
    }
    return copy;
    },

    //data의 Body, 경로 변수를 Object 형태로 반환
    parseReqBody : (req) => {
      let data = {}
      if(req.method == 'POST'){
        return req.body
      }
      else if(req.method == 'DELETE'){
        return req.params
      }

    },

    transaction : async (req,query) => {
      let rt = {
          ok : false,
          msg : '',
          result : null
      }
      let data = util.parseReqBody(req)
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
  },
};

module.exports = util;
