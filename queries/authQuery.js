const dbc = require("../dbconn.js");
const logger = require('../logger.js')
const authQuery = {
    checkId: function (data) {
      const query =  `
      SELECT 
      MBR_SEQ AS SEQ,
      MBR_ID AS ID,
      MBR_NM AS NAME,
      MBR_PWD AS PWD,
      MBR_SALT AS SALT,
      MBR_ROLE AS ROLE
      FROM MBR
      WHERE MBR_ID = ${dbc.escape(data.id)}`
      logger.info('checkId',{message:query})
      return query
    },
    signUp : function(data){
        const query = `
        INSERT INTO MBR(
            MBR_ID,
            MBR_PWD,
            MBR_SALT,
            MBR_NM,
            MBR_EMAIL,
            MBR_ROLE,
            MBR_MOD_DTM,
            MBR_REG_DTM,
            MBR_USE_TF
        )VALUES(
            ${dbc.escape(data.id)},
            ${dbc.escape(data.pwd)},
            ${dbc.escape(data.salt)},
            ${dbc.escape(data.name)},
            ${dbc.escape(data.email)},
            'PENDING',
            now(),
            now(),
            true
        );`
        logger.info('signUp',{message:query})
        return query
    },
    signUpCheck : function(data){
      const query = `
      UPDATE MBR SET
        MBR_ROLE = 'USER',
        MBR_MOD_DTM = NOW()
      WHERE MBR_ID = ${dbc.escape(data.id)}
      `
      logger.info('signUpCheck',{message:query})
      return query
    }
  };

  
module.exports = authQuery;