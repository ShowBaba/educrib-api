var express = require('express');
var router = express.Router();


// TODO: Serve a documentation page
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Edu Crib' });
});

module.exports = router;
