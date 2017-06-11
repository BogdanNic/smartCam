var express = require('express');
var router = express.Router();
const fs = require('fs');
const path =require('path');
const location = path.join(__dirname,'..','recordings');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/phone', function(req, res, next) {
  res.render('phone', { title: 'Phone' ,type:'WebRtc' });
});
router.get('/history', function(req, res, next) {
  var people=[];
  
//console.log(location);
fs.readdir(location, (err, files) => {
  if (!err)
  files.forEach(file => {
    if (!file.isDir)
    console.log(file);
  });
  //console.log(files);
});
people.push({firstname:'bogdan'},{lastname:'nic'});
people.push({firstname:'vb2'},{lastname:'nic2'});
  res.render('history', { title: 'History' ,type:'Date', people:people});
});
module.exports = router;
