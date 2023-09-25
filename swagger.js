const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        openapi:"3.0.0",
        info : {
            title : 'SR SYSTEM-API TEST'
            ,version : '1.0.0'
            ,description : 'API 문서화'
        },
        host:'localhost:3000',
        basePath:'/',
    },
    apis:['./routes/*.js','/swagger/*']    
}

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
}