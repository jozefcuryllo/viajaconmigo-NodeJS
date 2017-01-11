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
var debug = require('express-debug');
var breadcrumb = require('express-url-breadcrumb');
var moment = require('moment');
var  qt = require('quickthumb');

// Connection URL
var url = 'mongodb://jcuryllo:qwerty@ds147167.mlab.com:47167/ulpgcasw';
var mongoose = require('mongoose');
mongoose.connect(url);


var app = express();
var port = process.env.PORT || 3000;


var userSchema = mongoose.Schema({
    name: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    created: Date,
    modified: Date
});

var User = mongoose.model('User', userSchema);

var commentSchema = mongoose.Schema({
    _userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: {type: String, unique: true, required: true},
    created: Date,
    modified: Date

});
var Comment = mongoose.model('Comment', commentSchema);
var placeSchema = mongoose.Schema({
    _id: {type: String},
    name: String,
    description: String,
    latitude: Number,
    longitude: Number,
    images: [{
        description: String,
        filename: String,
        mimetype: String,
        created: Date
    }],
    created: Date,
    modified: Date,
    articles: [{type: String, ref: 'Article'}],
    comments: [commentSchema]
});
var Place = mongoose.model('Place', placeSchema);

var articleSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    _userId: {type: String, ref: 'User'},
    _placeId: {type: String, ref: 'Place'},
    name: String,
    description: String,
    content: String,
    created: Date,
    modified: Date
});
var Article = mongoose.model('Article', articleSchema);


app.use(session({secret: 'keyboard cat', cookie: {maxAge: 600000, _expires: 60000000}}));
app.use(passport.initialize());
app.use(passport.session());
app.enable('trust proxy');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/uploads', qt.static(__dirname + "/uploads"));
app.use('/public', express.static(__dirname + "/public"));
var DepLinker = require('dep-linker');
DepLinker.copyDependenciesTo('./public');
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('morgan')('combined'));
app.use(bodyParser());

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

app.use(breadcrumb(function (item, index) {
    item.label = item.label.capitalize();
}));

moment().format();

passport.use(new Strategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        successRedirect: '/',
        failureRedirect: '/users/login'

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

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});

var users = require('./routes/users');
var places = require('./routes/places');
var articles = require('./routes/articles');

app.use('/', places);
app.use('/users', users);
app.use('/places', places);
app.use('/articles', articles);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//debug(app, {});
app.listen(port);

module.exports = mongoose;
module.exports = app;
module.exports = moment;