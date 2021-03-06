var express = require('express');
var path = require('path');
var os = require('os');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
//var mongodb=require('mongodb');
var index = require('./routes/index');
var users = require('./routes/users');
var userCtrl = require('./controllers/userController');
var recordCtrl = require('./controllers/recordController');
var app = express();
var moment = require('moment');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'recordings'))); 
app.use("/recordings",express.static(path.join(__dirname, "/recordings")));
app.use("/pictures",express.static(path.join(__dirname, "/pictures")));
app.use('/', index);
app.use('/users', users);  
var db ={};
var url=process.env.MONGODB_URI;

if(url){
    console.log(url);
   // db=mongoose.connect(url).connection;

}else
{
    db=mongoose.connect("mongodb://localhost:27017/records").connection;
}
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected");
});

var User =require ('./models/userSchema');
var Record = require('./models/recordSchema');



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
//userCtrl.insert({name:"server"},function(e){
//	console.log(e);
//});
var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          console.log('ipaddr', details.address);
        }
      });
    }

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
