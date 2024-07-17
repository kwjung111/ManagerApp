class RedisMessageDTO{
    constructor(sender,code,content){
        this.sender = sender;
        this.code = code;
        this.content = content;
    }

}

module.exports = RedisMessageDTO;