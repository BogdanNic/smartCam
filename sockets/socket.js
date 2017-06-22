var User =require ('../models/userSchema');
var Record = require('../models/recordSchema');
var recordCtrl = require('../controllers/recordController');
var userCtrl = require('../controllers/userController');
var uuid=require("node-uuid");
module.exports=function(io,fs,path){
var clients = [];
var users = [];
var tempUser ;
var tempTime;
var startTime;
 io.on('connection', function (socket) {



if(clients.length==0)
{
  socket.emit("isServer",true);	
}else{
 socket.emit("isServer",false);	
}

clients.push(socket);



// convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

 socket.on('login', function (user) {
	 //user.socket = socket;
	 console.log(user);
	 var userIndex = users.findIndex(u => u.id === user.id || u.name === user.name);
	 if (userIndex === -1) {

		 var dd = userCtrl.login({name: user.name, email: user.id}, function (u) {

			 if (u) {
				 console.log('has user', u);
				 user._id = u._id;
				 users.push(user);
				 tempUser = u;
				 console.log(users);
			 }
		 });

	 }
	 users.push(user);
	 io.emit("users connected", users);
	 //socket.broadcast.to(user.id).emit('users connected',users);

 });


    
    socket.on('call user', function (userId) {
        console.log("asdsa");
        var user = users.find(u=>u.id === userId);
        if (user){
            console.log("user faund",user);
            socket.broadcast.to(userId).emit('remote user', user);
        }
        
    });
     socket.on("call Server",function(user){
         console.log("call Server "+user.id);
         // socket[user.id].emit("receive Call",user.name);
         socket.broadcast.emit("receive Call",user);
     });
    socket.on('messageRTC', function (message) {
      console.log('messag',message);
      if (message.type !== 'answer'){
        socket.broadcast.to(message.id).emit('messageRTC', message);
      }
      else { 
          socket.broadcast.emit('messageRTC', message);
      }
                
        //socket.broadcast.to(message.id).emit('messageRTC', message);
    });
  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var numClients = clients.length;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 1) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 2) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    clients.pop(socket);
    console.log('received bye');
  });
	
  var videoStream;
  
  socket.on('video-start', function(){
    console.log('video-start');
   // tempName =path.join(__dirname,'..','recordings',uuid.v1()+'.webm'); 
    var tempName =path.join('./','recordings',uuid.v1()+'.webm');  
    startTime=new Date().getTime();
    console.log(startTime);
    videoStream = fs.createWriteStream(tempName);
    videoStream.on('finish',function(){
    fs.stat(tempName,function(err,stats){
      var duration = new Date().getTime()-startTime;
      recordCtrl.insert(tempUser,tempName, stats['size'],duration,stats['ctime'],e=>console.log(e));
    });
});
  });
  socket.on('video', function(chunk){
    //console.log('data');
    videoStream.write(chunk);
  });  
  socket.on('video-end', function(){
    
    //console.log('video-end');
    
    setTimeout(function(){
      videoStream.end();
    },500);
  });


 socket.on('disconnect', function() {
      console.log('Got disconnect!');
      var deleteIndex = -1;
      users.forEach(function (user) {
        if (user.id === socket.id) {
          deleteIndex = users.indexOf(user);
        }
      }, this);

      if (deleteIndex > -1) {
        users.splice(deleteIndex, 1);
      }

      socket.broadcast.emit("users connected", users);
   });

socket.on('sendImage',function(data){
  
var buf = Buffer.from(data, 'base64'); // Ta-da
fs.writeFile('myFile.png', buf, function(err) {
    if(err)
	console.log(err);
  });
  //console.log(data);
});
fs.readFile(__dirname+'/../bin/images/image1.png', function(err, buffer){
	if(err)
	{ 
		console.log(err);
		return ;
	}
        socket.emit('image', { buffer: buffer });
    });
});
}