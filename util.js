const util = {
  makeTree: (posts, memos) => {
    console.log(memos)
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
};

module.exports = util;
