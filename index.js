var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

// Connection URL
var url = 'mongodb://jcuryllo:qwerty@ds147167.mlab.com:47167/ulpgcasw';
var mongoose = require('mongoose');
mongoose.connect(url);



var app = express();
var port = process.env.PORT || 3000;
app.listen(port);

var userSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    password: String,
    email: String,
    created: Date,
    modified: Date
});

var placeSchema = mongoose.Schema({
    name: String,
    description: String,
    latitude: Number,
    longitude: Number
});

var User = mongoose.model('User', userSchema);
var Place = mongoose.model('Place', placeSchema);

app.use(session({secret: 'keyboard cat', cookie: {maxAge: 60000}}));
app.use(passport.initialize());
app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('morgan')('combined'));
app.use(bodyParser());


passport.use(new Strategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, cb) {
        User.findOne({email: email}, function (err, user) {
            if (err) {
                console.log("Error!")
                console.log(err);
                return cb(err);
            }
            if (!user) {
                console.log("User does not exist!");
                return cb(null, false);
            }
            if (user.password !== password) {
                console.log("Password is incorrect!");
                console.log("Password: " + user.password);
                console.log("Password: " + password);
                console.log("User: " + JSON.stringify(user));
                return cb(null, false);
            }
            console.log("Logged in");
            return cb(null, user);
        });

    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    console.log("Is authenticated: " + req.isAuthenticated());
    next();
});


var routes = require('./routes/index');
var users = require('./routes/users');
var places = require('./routes/places');

app.use('/', routes);
app.use('/users', users);
app.use('/places', places);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = mongoose;
module.exports = app;
