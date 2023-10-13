const morgan = require('morgan')
const logger = require('../logger.js')


const format = () => {
    const result = process.env.NODE_ENV === 'PRD' ? 'combined' : 'dev';
    return result;
 };

const stream = {
    write : (message) =>{
        logger.info(message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ""));
    }
}

const skip = (_,res) => {
    return false
}


const morganMdw = morgan(format(), {stream, skip})


module.exports = morganMdw;