require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

const app = express();
const ejs = require('ejs')
const server = require('http').Server(app);
const { v4: uuidV4 } = require('uuid');
const io = require("socket.io")(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const userS = [], userI = [];

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(session ({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://admin-karina:Karina002@cluster0.egpxh.mongodb.net/userDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex',true);

const userSchema = new mongoose.Schema ({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://teams-clone-karina.herokuapp.com/auth/google/user",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

app.get("/", function (req, res) {
    res.render("home");
});
//Google Authenication
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/user",
  passport.authenticate('google', { failureRedirect: "/signin" }),
  function(req, res) {
    // Successful authentication, redirect to user.
    res.redirect("/user");
  });

app.get("/signup", function (req, res) {
    res.render("signup")
})

app.get("/signin", function (req, res) {
    res.render("signin")
})

app.get("/user", function (req, res) {
    if(req.isAuthenticated()){
        res.render("user");
    }
    else {
        res.redirect("/signin");
    }
});

app.get("/logout", function(req,res) {
  req.logout();
  res.redirect("/");
})

app.post("/signup", function (req, res) {
    User.register({firstname:req.body.firstname,lastname:req.body.lastname,username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/signup");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/user");
          });
        }
      });
});

app.post("/signin", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
      });
    
      req.login(user, function(err){
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/user");
          });
        }
      });
});


app.post("/user", function (req, res) {
    const meet = req.body.meetURL;
    console.log(meet);
    res.redirect(meet);
})

app.get('/room', (req, res) => {
  
    if(req.isAuthenticated()){
      res.redirect(`/${uuidV4()}`);
    }
    else {
      res.redirect("/signin");
    }

});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {

        userS.push(socket.id);
        userI.push(userId);
        console.log("room Id:- " + roomId, "userId:- " + userId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('removeUser', (sUser, rUser) => {
            var i = userS.indexOf(rUser);
            if (sUser == userI[0]) {
                console.log("SuperUser Removed" + rUser);
                socket.broadcast.to(roomId).emit('remove-User', rUser);
            }
        });
        
        socket.on('message', (message, yourName) => {
            io.to(roomId).emit('createMessage', message, yourName);

        })

        socket.on('disconnect', () => {
            //userS.filter(item => item !== userId);
            var i = userS.indexOf(socket.id);
            userS.splice(i, 1);
            socket.broadcast.to(roomId).emit('user-disconnected', userI[i]);
            //update array

            userI.splice(i, 1);
        });
        socket.on('seruI', () => {
            socket.emit('all_users_inRoom', userI);
            //console.log(userS);
            console.log(userI);
        });
        
    })

})



server.listen(process.env.PORT||3000, function () {
    console.log("Server has started successfully");
});

