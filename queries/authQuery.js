const dbc = require("../dbconn.js");
const authQuery = {
    checkId: function (data) {
      return `
      SELECT 
      MBR_SEQ AS SEQ,
      MBR_ID AS ID,
      MBR_PWD AS PWD,
      MBR_SALT AS SALT,
      MBR_ROLE AS ROLE
      FROM MBR
      WHERE MBR_ID = ${dbc.escape(data.id)}`
    },
    signUp : function(data){
        return`
        INSERT INTO MBR(
            MBR_ID,
            MBR_PWD,
            MBR_SALT,
            MBR_NM,
            MBR_EMAIL,
            MBR_ROLE,
            MBR_MOD_DTM,
            MBR_REG_DTM
        )VALUES(
            ${dbc.escape(data.id)},
            ${dbc.escape(data.pwd)},
            ${dbc.escape(data.salt)},
            ${dbc.escape(data.name)},
            ${dbc.escape(data.email)},
            'PENDING',
            now(),
            now()
        );
        `
    },
    signUpCheck : function(data){
      return`
      UPDATE MBR SET
        MBR_ROLE = 'USER'
      WHERE MBR_ID = ${dbc.escape(data.id)}
      `
    }
  };

  
module.exports = authQuery;