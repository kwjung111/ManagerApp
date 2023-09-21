const express = require("express")
const session = require('express-session')
const router = express.Router();

router
.get('/', (req, res) => {
    if (req.session) {
      res.send(`Hello ${req.session}`);
    } else {
      res.send('No data in session');
    }
    console.log(req.session)
  });

  module.exports = router;