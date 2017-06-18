var express = require('express');
var router = express.Router();
const fs = require('fs');
const path =require('path');
const location = path.join(__dirname,'..','recordings');
var recordCtrl = require('../controllers/recordController');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/recents', function(req, res, next) {
  recordCtrl.getRecents(function(recents){
    res.render('recents', { title: 'recente' ,type:'WebRtc' ,records:recents});
  });
}); 

router.get('/live', function(req, res, next) {
  res.render('live', { title: 'Live' ,type:'WebRtc' });
});
router.get('/streaming', function(req, res, next) {
  res.render('streaming', { title: 'Live' ,type:'WebRtc' });
});

router.get('/arhive', function(req, res, next) {
  recordCtrl.get(function (arr) {
    res.render('arhive', { title: 'Arhive' ,type:'Date', records:arr});
  });
});
module.exports = router;
