var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var flash = require('connect-flash');
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/viajaconmigo';
var db;

MongoClient.connect(url, function (err, database) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    db = database;
    //db.close();
});

var passport = require('passport');
var Strategy = require('passport-local').Strategy;

passport.use(new Strategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, cb) {


        db.collection('users').findOne({email: email}, function (err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password !== password) {
                return cb(null, false);
            }
            return cb(null, user);
        });

    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('morgan')('combined'));


app.use(bodyParser());
app.use(session({secret: 'keyboard cat', cookie: {maxAge: 60000}}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});

app.use('/', routes);

app.get('/register',
    function (req, res) {
        res.render('users/register');
    });

app.post('/register',
    function (req, res) {
        db.collection('users').save(req.body);

        res.redirect('/login');
    });

app.get('/login',
    function (req, res) {
        res.render('users/login');
    });

app.post('/login',
    passport.authenticate('local', {failureRedirect: '/login', successRedirect: '/', failureFlash: true}),
    function (req, res) {

        res.redirect('/');
    });

app.get('/logout',
    function (req, res) {
        req.logout();
        res.redirect('/');
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('profile', {user: req.user});
    });

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


module.exports = app;
