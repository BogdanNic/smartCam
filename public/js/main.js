'use strict';
var canvas = document.querySelector('canvas');
canvas.vidth = 480;
canvas.height = 360;



//..................webRTC..........................
navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constarints = {
    audio:false,
    video:true
};



var trackId=null;

var video = document.querySelector('video'); 
function successCallback(stream){
    
    trackId = stream.getVideoTracks()[0];
    mediaRecorder= new MediaRecorder(stream);
    //visualize(stream);
   
    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
     window.stream = stream;
    if (window.URL)
    {
        video.src = window.URL.createObjectURL(stream);
    	// video.src=stream;
	} 
    else
    {
        video.src = stream;
    }
     //video.src = stream;
     video.play();
}
function errorCallback(error)
{
    console.log('navigator.getUserMedia:error',error);
}


//..............Stop Stream...............

var stopStreamBtn = document.getElementById('stopStreamBtn');
stopStreamBtn.addEventListener('click', stopStream, false);
function stopStream()
{
  if (trackId != null)
  {
    video.pause();
    trackId.stop();

  }
}
//..............Start Stream...............
var startStreamBtn = document.getElementById('startStreamBtn');
startStreamBtn.addEventListener('click', startStream, false);
function startStream()
{
  var sd=2;
  if (isServer)
  {
    navigator.getUserMedia(constarints,successCallback,errorCallback);
  }
}


//................Capture Image ..........................

var button = document.getElementById('takePictureBtn');
button.onclick = function()
{
      canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
}

//..............Download Image...............

var downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', downloadCanvas, false);

function downloadCanvas() {
  var dt = canvas.toDataURL('image/png');
  /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
  dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
  
  let date = new Date().getMilliseconds();
  let attr = downloadBtn.attributes['download'].value='Canvas'+date+'.png';

  /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
  dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

  this.href = dt;
};

//...................Record Stream...........

var mediaRecorder;
var recordedBlobs = [];
var chunks = [];
 
var  recordButton = document.getElementById("startRecordingBtn");
recordButton.addEventListener('click', startRecording, false);


var  downloadRecordingBtn = document.getElementById("downloadRecordingBtn");
downloadRecordingBtn.addEventListener('click', download, false);

function startRecording() {
  mediaRecorder.start(30);
      console.log(mediaRecorder.state);
      console.log("recorder started");
      //record.style.background = "red";
      //record.style.color = "black";
}

function handleDataAvailable(event) {
  console.log("Sds");
 chunks.push(e.data);
}

function stopRecording() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      //record.style.background = "";
      //record.style.color = "";
}


function download() {
  //stopRecording();
   mediaRecorder.stop();
   
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
 
      console.log("recorder stopped"+chunks.length);
 
  
  var blob = new Blob(chunks, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
var serverBtn  = document.getElementById("serverBtn");
var input = document.getElementById("inputServer");

serverBtn.onclick =function(e){ 
  setServer(true);
  input.value=isServer;
}
var isServer=true;
function setServer(server)
{
  isServer = server;
}
 var socket = io.connect('http://localhost:3000');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
  socket.on('isServer',function(data){
    isServer=data;
    input.value=isServer;
  });
