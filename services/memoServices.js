const memoDao = require('../dao/memoDao.js')
const {wsJson,broadcast} = require('../wss.js')

const memoService = {
    getMemo : async (data) => {
        const ret = await memoDao.getMemo()
        return ret
    },
    addMemo : async (data) => {
        const ret =  await memoDao.addMemo(data)
        ret.result.postSeq = data.postSeq
        if(ret.ok == true){
            broadcast(new wsJson("event")
            .event("POST","memos",data.memoSeq,data.UID,data.content,{postSeq:data.postSeq}))
        }

        return ret
    },
    deleteMemo : async (data) => {
        const ret = await memoDao.deleteMemo(data)
        if(ret.ok == true){
            broadcast(new wsJson("event")
            .event("DELETE","memos",data.memoSeq,null,null))
        }
        return ret
    }
}

module.exports = memoService