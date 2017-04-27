var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/phone', function(req, res, next) {
  res.render('phone', { title: 'Phone' ,type:'WebRtc' });
});
module.exports = router;
