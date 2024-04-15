const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file')
const env = process.env.NODE_ENV;

const { combine, timestamp, label, printf } = winston.format;

let logLevel = 'error'

if(env !== 'PRD'){
    logLevel = 'data'
}

const config = {
    levels : {
        error: 0,
        info: 1,
        warn: 2,
        debug: 3,
        data: 4,
        verbose: 5,
        silly: 6,
        custom: 7
    },
    colors: { 
        error: 'red',
        info: 'green',
        warn: 'yellow',
        debug: 'blue',
        data: 'magenta',
        verbose: 'cyan',
        silly: 'grey',
        custom: 'yellow'
    }
}


//* 로그 파일 저장 경로 → 루트 경로/logs 폴더
const logDir = `${process.cwd()}/logs`;

//* log 출력 포맷 정의 함수
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] ▶ ${message}`; // 날짜 [시스템이름] 로그레벨 메세지
 });

 

const logger = winston.createLogger({
    levels: config.levels,
    level : logLevel,
    format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
    ),
    transports:[
        new winstonDaily({
            level:'info',
            datePattern: "YYYY-MM-DD",
            dirname:logDir,
            filename:"%DATE%.log",
            maxsize:"30m",
            maxFiles: "30d"
        })
    ],
    
    exceptionHandlers: [
    new winstonDaily({
       level: 'error',
       datePattern: 'YYYY-MM-DD',
       dirname: logDir,
       filename: `%DATE%.exception.log`,
       maxFiles: 30,
       zippedArchive: true,
    }),
 ],
})

winston.addColors(config.colors)

logger.add(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat,
        )
    })
)


module.exports = logger