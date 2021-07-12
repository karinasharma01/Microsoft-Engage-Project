const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const userDropDown = document.getElementById('myDropdown');
const myVideo = document.createElement('video');
myVideo.muted = true;
let peers = {}, currentPeer = [];
let userlist = [];
let cUser;

const myName = prompt('Enter your name');
console.log(myName);

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
}).then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);


  peer.on("call", call => {
    console.log("Answered");
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
      currentPeer.push(call.peerConnection);
      call.on("close", function () {
        video.remove();
        peers[call.peer] = call;
        alert("The videocall has finished");
      });
    });
 
  socket.on('user-connected', (userId) => {
    console.log('User ID Connected: ' + userId);
    connectToNewUser(userId, stream);
  })

});

//To handle the event of a user getting disconnected in a room
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
  console.log('User ID Disconnected:' + userId);
});

//connecting to a new user
const connectToNewUser = (userId, stream) => {
  console.log('User-connected :-' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove()
  });
  //currentPeer = call.peerConnection;
  peers[userId] = call;
  currentPeer.push(call.peerConnection);
  console.log(currentPeer);
};

peer.on('open', async id => {
  cUser = id;
  await socket.emit('join-room', ROOM_ID, id, myName);

})

//For adding a user's video stream
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.controls = true;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

//Option to mute & unmute yourself in a meeting
const setMuteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setMuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setUnmuteButton();
  }
}

//code to allow users to unmute themseleves
const setUnmuteButton = () => {
  const html = `<i class="fas fa-microphone-alt"></i>
                <span>Mute</span>`;
  document.querySelector('.Mute__button').innerHTML = html;
  console.log("You are Unmuted");
}

//to allow the users to mute themseleves
const setMuteButton = () => {
  const html = `<i class="fas fa-microphone-alt-slash" style="color:red;"></i>
                <span>Unmute</span>`;
  document.querySelector('.Mute__button').innerHTML = html;
  console.log("Muted");
}

//Starting & stopping video
const setVideoControls = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setVideoOff();
  } else {
    setVideoOn();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

//to start your video
const setVideoOn = () => {
  const html = `<i class="fas fa-video"></i>
                <span>Stop Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;
  console.log("Video set On.");
}

//to stop your video
const setVideoOff = () => {
  const html = `<i class="fas fa-video-slash" style="color:red;"></i>
                <span>Start Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;
  console.log("Video set OFF");
}

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy the below link & share it with people you wanna connect with!",
    window.location.href
  );
});

//sending messages to different users in a room
let inputText = $('input');

$('html').keydown((e) => {
  if (e.which == 13 && inputText.val().length !== 0) {
    console.log(inputText.val());
    socket.emit('message', inputText.val(), myName);
    inputText.val('')
  }
});

//Print msg in room
socket.on('createMessage', (msg, user) => {
  $('ul').append(`<li class= "message"><small>${user === myName ? "Me" : user}</small><br>${msg}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//Feature to allow users to share their Screen
const screenshare = () => {
  navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true
    }

  }).then(stream => {
    let videoTrack = stream.getVideoTracks()[0];
    videoTrack.onended = function () {
      stopScreenShare();
    }
    for (let x = 0; x < currentPeer.length; x++) {

      let sender = currentPeer[x].getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      })

      sender.replaceTrack(videoTrack);
    }

  })

}
//To stop sharing the user's screen
function stopScreenShare() {
  let videoTrack = myVideoStream.getVideoTracks()[0];
  for (let x = 0; x < currentPeer.length; x++) {
    let sender = currentPeer[x].getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack);
  }
}

//Hand Raise Option
const raiseHand = () => {
  //display the name of the user who raised hand along with sending the message to all other users.
  const displayText = `${myName} has raised hand.`;
  socket.emit('message', displayText, myName);
  unChangeHandIcon();
}

const unChangeHandIcon = () => {
  const html = `<i class="far fa-hand-paper" style="color:red;"></i>
                <span>Raised</span>`;
  document.querySelector('.raiseHand').innerHTML = html;
  console.log("Change")
  changeHandIcon();
}

const changeHandIcon = () => {
  setInterval(function () {
    const html = `<i class="far fa-hand-paper" style="color:"white"></i>
                <span>Hand</span>`;
    document.querySelector('.raiseHand').innerHTML = html;
  }, 3000);
}


socket.on('remove-User', (userId) => {
  if (cUser == userId) {
    disconnectNow();
  }
});

const getUsers = () => {
  socket.emit('seruI',);

}

const listOfUser = () => {
  //userDropDown.innerHTML = '';
  while (userDropDown.firstChild) {
    userDropDown.removeChild(userDropDown.lastChild);
  }
  for (var i = 0; i < userlist.length; i++) {
    var x = document.createElement("a");
    var t = document.createTextNode(`Participant ${i + 1}`);
    x.appendChild(t);
    userDropDown.append(x);
  }
  const anchors = document.querySelectorAll('a');
  for (let i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', () => {
      console.log(`Link is clicked ${i}`);
      anchoreUser(userlist[i]);
    });
  }
}

const anchoreUser = (userR) => {
  socket.emit('removeUser', cUser, userR);
}


socket.on('all_users_inRoom', (userI) => {
  console.log(userI);
  userlist.splice(0, userlist.length);
  userlist.push.apply(userlist, userI);
  console.log(userlist);
  listOfUser();
  document.getElementById("myDropdown").classList.toggle("show");
});
