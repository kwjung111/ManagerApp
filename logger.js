const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file')
const env = process.env.NODE_ENV;

const { combine, timestamp, label, printf } = winston.format;

//* 로그 파일 저장 경로 → 루트 경로/logs 폴더
const logDir = `${process.cwd()}/logs`;

//* log 출력 포맷 정의 함수
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`; // 날짜 [시스템이름] 로그레벨 메세지
 });

const logger = winston.createLogger({
    format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    label({ label: 'SRSYS' }), 
    logFormat,
    ),
    transports:[
        new winstonDaily({
            level:"info",
            datePattern: "YYYY-MM-DD",
            dirname:logDir,
            filename:"%DATE%.log",
            maxsize:"30m",
            maxFiles: "30d"
        })
    ]
})


if(env !== 'PRD'){
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            )
        })
    )
}//개발계에서 로그 확인

module.exports = logger;