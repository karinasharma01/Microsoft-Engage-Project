const socket = io('/');  //socket connection
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
    //var callAccepted = confirm("Incoming VideoCall");
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
    /*
    if (callAccepted) {
      console.log("Answered");
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
      //currentPeer = call.peerConnection;
      currentPeer.push(call.peerConnection);
      // Handle when the call finishes
      call.on("close", function () {
        video.remove();
        peers[call.peer] = call;
        alert("The videocall has finished");
      });
      // use call.close() to finish a call
    } else {
      console.log("Call denied !");
    }
  });
*/
  socket.on('user-connected', (userId) => {
    console.log('user ID fetch connection: ' + userId);
    connectToNewUser(userId, stream);
  })

});


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
  console.log('user ID fetch Disconnect: ' + userId);
});


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

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.controls = true;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setMuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setUnmuteButton();
  }
}

const setUnmuteButton = () => {
  const html = `<i class="fas fa-microphone-alt"></i>
                <span>Mute</span>`;
  document.querySelector('.Mute__button').innerHTML = html;
  console.log("You are Unmuted");
}

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone-alt-slash" style="color:red;"></i>
                <span>Unmute</span>`;
  document.querySelector('.Mute__button').innerHTML = html;
  console.log("Muted");
}


//Video ON or OFF
const videoOnOff = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    unsetVideoButton();
  } else {
    setVideoButton();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setVideoButton = () => {
  const html = `<i class="fas fa-video"></i>
                <span>Stop Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;
  console.log("Cammera Mode ON");
}

const unsetVideoButton = () => {
  const html = `<i class="fas fa-video-slash" style="color:red;"></i>
                <span>Start Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;
  console.log("Cammera Mode OFF");
}

//code for disconnect from client
const disconnectNow = () => {
  const userLocation = "https://nameless-scrubland-25642.herokuapp.com/user";
  if(userLocation==""||userLocation==NULL)
  {
    userLocation="https://localhost:3000/user";
  }
  window.location = `${userLocation}`;
}

//code to share url of roomId
/*const share = () => {
  var share = document.createElement('input'),
    text = window.location.href;

  console.log(text);
  document.body.appendChild(share);
  share.value = text;
  share.select();
  document.execCommand('copy');
  document.body.removeChild(share);
  alert('Copied');
}*/

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

//msg sen from user
let text = $('input');

$('html').keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());
    socket.emit('message', text.val(), myName);
    text.val('')
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

//screenShare
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

function stopScreenShare() {
  let videoTrack = myVideoStream.getVideoTracks()[0];
  for (let x = 0; x < currentPeer.length; x++) {
    let sender = currentPeer[x].getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack);
  }
}

//raised hand
const raisedHand = () => {
  const displayText = `${myName} has raised hand.`;
  socket.emit('message', displayText, myName);
  unChangeHandLogo();
}

const unChangeHandLogo = () => {
  const html = `<i class="far fa-hand-paper" style="color:red;"></i>
                <span>Raised</span>`;
  document.querySelector('.raisedHand').innerHTML = html;
  console.log("change")
  changeHandLogo();
}

const changeHandLogo = () => {
  setInterval(function () {
    const html = `<i class="far fa-hand-paper" style="color:"white"></i>
                <span>Hand</span>`;
    document.querySelector('.raisedHand').innerHTML = html;
  }, 3000);
}

//kick option

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
    var t = document.createTextNode(`VideoSector ${i + 1}`);
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
