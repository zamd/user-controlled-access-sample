const express = require('express'),
      _ = require('dotenv').config(),
      path = require('path'),
      favicon = require('serve-favicon'),
      logger = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      index = require('./routes/index'),
      session = require('express-session'),
      passport = require('passport'),
      ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
      Auth0Strategy = require('passport-auth0').Strategy,
      app = express(),
      api = require('./lib/apiClient');
  
passport.use(new Auth0Strategy({
    domain: process.env.Domain,
    clientID:process.env.ClientID,
    clientSecret: process.env.ClientSecret,
    callbackURL: process.env.CallbackURL,
    scope: "openid email profile"
},async (_1,_2,_3, profile, done) => {
  
  const authorized_access =  profile._json["http://user.controlled.access/authorized_access"];
  profile.email = profile._json.email;
  if (authorized_access) {
    profile.authorized_access = authorized_access;
  }
  
  profile.user_controlled_access = await api.getAppMetadata(profile.user_id);
  done(null,profile);
}));

//TODO: fix user serialization
passport.serializeUser((user,done)=>done(null, user));
passport.deserializeUser((user,done)=>done(null,user));

app.use(session({resave:true, saveUninitialized:true, secret:"session_xxx3"}));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', passport.authenticate('auth0', { failureRedirect: '/login' }), (req,res)=>res.redirect('/'));
app.use('/logout', ensureLoggedIn(), (req,res,next)=>{req.logOut(); res.end('logged out!');});
app.use('/access', ensureLoggedIn(), require('./routes/access'));

app.use('/account', ensureLoggedIn(), require('./routes/account'));
app.use('/', ensureLoggedIn(), index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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