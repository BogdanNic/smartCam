'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var isServer;

var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: false,
  offerToReceiveVideo: true
};

/////////////////////////////////////////////

var room = 'foo';
// Could prompt for room name:
// room = prompt('Enter room name:');

var socket = io.connect();



socket.on('isServer',function(data){
    isServer=data;
    input.value=isServer;
    if (isServer)
    {
          
    }

});


socket.on("users connected", function (data) {
    console.log("user conneced", data);
    clearConnectList();
    document.getElementById("remotes").re
    data.forEach(function (user) {
        createLabelledButton(user);
    }, this);
});

socket.on('teste', function (message) {
    console.log(message);
});

socket.on('remote user', function (user) {
    remoteUser = user;
    console.log("remote user", user);
});

//bug in socket.io TODO: Fixit
var setRemote=false;//for receiveing data 

socket.on("messageRTC", function (message) {
  //console.log("message arrived ", message.type);
  delete message.id;
   switch (message.type) {
        case "offer": 
                    pc.setRemoteDescription(message)
                    .then( () =>pc.createAnswer())
                    .then( (answer) =>  pc.setLocalDescription(answer))
                    .then( () => send(pc.localDescription))  
                    .catch(logError);
                    break;
        case "answer": 
                      if (!setRemote) //not revceive twice data
                      pc.setRemoteDescription(message).catch((e) => console.log(error));
                      setRemote = true;
                      break;
        case "candidate": 
                        pc.addIceCandidate(message.candidate).catch(logError);
                        break;
       default: console.log("a error with transmition of sdp",message);
    }
});

////////////////////////////////////////////////////

var localVideo = document.querySelector('#localvideo');
var remoteVideo = document.querySelector('#remotevideo');
var input = document.querySelector("#inputServer");
var startStreamBtn = document.querySelector("#startStreamBtn");

var connectButton = document.getElementById("connectBtn");
connectButton.addEventListener('click', connect, false);

var loginButton = document.getElementById("loginBtn");
loginButton.addEventListener('click', login, false);
var loginInput = document.getElementById("loginInput");

var currentUser,remoteUser;

function connect(){
  alert("connect");
}
function login(){
  name = loginInput.value;

    if (name.length > 0) {
        currentUser = { name: name, id: socket.id };
        socket.emit("login", currentUser);
        createPeerConnection();
    }
}

function createLabelledButton(user) {
    var button = document.createElement("button");
    var id = user.id;
    button.onclick = function (user) {
        return function () {
            performCall(user);
        };
    }(user);

    button.appendChild(document.createTextNode(user.name));
    document.getElementById("remotes").appendChild(button);
    return button;
}
function clearConnectList() {
    var otherClientDiv = document.getElementById("remotes");
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}
function logError(error) {
    console.log(error.name + ": " + error.message);
}

function performCall(user) {
    socket.emit('call user', user.id);
    remoteUser = user;
    pc.addStream(localStream);
    createOffer();
}
startStreamBtn.onclick=function(e){
  alert('start stream');
}

function getCamera(){
  navigator.mediaDevices.getUserMedia({ audio: false, video: true})
  .then(gotStream)
  .catch( e => alert('getUserMedia() error: ' + e.name));
}


function gotStream(stream) {
  console.log('Adding local stream.');
  localVideo.src = window.URL.createObjectURL(stream);
  mediaRecorder = new MediaRecorder(stream);
  localStream = stream;
  
}


if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}



window.onbeforeunload = function() {
  sendMessage('bye');
};

///////////////////////////// Recording Stream
var mediaRecorder;
var recordedBlobs = [];
var chunks = [];


var  recordButton = document.getElementById("startRecordingBtn");
recordButton.addEventListener('click', startRecording, false);
var  downloadRecordingBtn = document.getElementById("downloadRecordingBtn");
downloadRecordingBtn.addEventListener('click', download, false);

function startRecording() {
  mediaRecorder.start(30);
  socket.emit("video-start");
  mediaRecorder.ondataavailable =handleDataAvailable;
      console.log(mediaRecorder.state);
      console.log("recorder started");
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    chunks.push(event.data);
    socket.emit("video",event.data);
  }
}
function stopRecording() {
      mediaRecorder.stop();
      socket.emit('video-end');
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      //record.style.background = "";
      //record.style.color = "";
}
function download() {
  //stopRecording();
   mediaRecorder.stop(); 
      socket.emit('video-end');
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



/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    
    console.log('Created RTCPeerConnnection');
   getCamera();
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}
function createOffer() {
    trace('createOffer start');
    pc.createOffer(sdpConstraints).then(
        onCreateOfferSuccess,
        onCreateSessionDescriptionError
        );
}
function onCreateOfferSuccess(desc) {
    trace('setLocalDescription start');
    pc.setLocalDescription(desc).then(
        () => { send(desc); }
    )

}
function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
     send({ type: "candidate", candidate: event.candidate });
  } else {
    console.log('End of candidates.');
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}
function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function send(data) {
    console.log("sending", data.type);
    if (!remoteUser) {
        console.log(remoteUser, "user is not difinede function send");
        return;
    }
   // data.id = remoteUser.id;

    if (data.type === "offer") {
        data = {
            type: data.type,
            sdp: data.sdp,
            id: remoteUser.id
        }

    }
    if (data.type === "candidate") {
        data = {
            type: data.type,
            candidate: data.candidate,
            id: remoteUser.id
        }
    }
    if (data.type === "answer") {
        data = {
            type: data.type,
            sdp: data.sdp,
            id: remoteUser.id
        }
    }
    socket.emit('messageRTC', data);
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].url.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  pc.close();
  pc = null;
}
function trace(text) {
    if (text[text.length - 1] === '\n') {
        text = text.substring(0, text.length - 1);
    }
    if (window.performance) {
        var now = (window.performance.now() / 1000).toFixed(3);
        console.log(now + ': ' + text);
    } else {
        console.log(text);
    }
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('m=audio') !== -1) {
      mLineIndex = i;
      break;
    }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex],
          opusPayload);
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) { // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length - 1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}