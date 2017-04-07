const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const promise = require('promise');
const rp = require('request-promise');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
let app = express();

let port = process.env.PORT || 3000;
app.listen(port,() => { console.log(`Listening on port ${port}`); })

app.use(cookieSession({ secret: 'secret'})) // give access to req.session

app.use(passport.initialize());
app.use(passport.session());

const GoogleStrategy = require('passport-google-oauth20').Strategy;

console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);
console.log(process.env.GOOGLE_CALLBACK_URL);

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },

  function onSuccessfulLogin(token, refreshToken, profile, done) {
    done(null, {token, profile});

    console.log(token);
    //do stuff here!
  }
));

let scope = [process.env.GOOGLE_GMAIL_FULL_ACCESS_SCOPE, process.env.GOOGLE_PLUS_API_SCOPE];
console.log(scope);
app.get('/auth/google', passport.authenticate('google', { scope: scope}));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', successFailure: '/login'}));
app.get('/login',() => {
  console.log('login route');
  res.json({message:'You just got booted to the login page.'})
})

passport.serializeUser((object, done) => {
  console.log("Serialize User", {token: object})
  done(null, {token: object.token})
})

passport.deserializeUser((object, done) => {
  console.log("Deserialize User", object)
  done(null, object)
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/'); //Can fire before session is destroyed?
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function(req, res, next) {
  res.json({session: req.session, user: req.user, profile: req.profile});
});

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
