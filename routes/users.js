var express = require('express');
var router = express.Router();

/* GET users listing. */
module.exports = function(pool) {
  router.get('/users', function(req, res, next) {
    res.render('error');
  });
  
  return router;
  }
