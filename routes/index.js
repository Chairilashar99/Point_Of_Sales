var express = require('express');
var router = express.Router();

/* GET home page. */
module.exports = function(pool) {
router.get('/', function(req, res, next) {
  res.render('index');
});

return router;
}