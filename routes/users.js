var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('mongoose').model('User');
var bcrypt = require('bcrypt');


router.get('/register',
    function (req, res) {
        res.render('users/register');
    });

router.post('/register',
    function (req, res) {
        var myUser = new User({
            _id: require('mongoose').Types.ObjectId(),
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            created: new Date(),
            modified: new Date()
        });

        if (req.body.password == req.body.repassword) {
            myUser.password = bcrypt.hashSync(myUser.password, 10);
            myUser.save(function (err) {
                if (!err) {
                    req.flash('success_messages', "User has been saved! You can log in using your credentials.");
                    return res.redirect('/users/login');
                }
                else {
                    req.flash('error_messages', "Error - can't save a new user! Try again. Error message: " + err.message);

                    return res.redirect('/users/register');
                }
            });
        }
        else {
            req.flash('error_messages', "Passwords did not match.");
            return res.redirect('/users/register');
        }


    });

router.get('/login',
    function (req, res) {
        res.render('users/login');
    });

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            req.flash('error_messages', "Authentication failed!");
            return res.redirect('back');
        }

        if (!user) {
            req.flash('error_messages', "Authentication failed!");
            return res.redirect('back');
        }

        req.login(user, function (err) {
            if (err) {
                req.flash('error_messages', "Authentication failed!");
                return res.redirect('/users/register');
            }

            req.flash('success_messages', "Authentication success!");
            return res.redirect('/');
        });
    })(req, res, next);
});


router.get('/logout',
    function (req, res) {
        req.logout();
        return res.redirect('/');
    });

router.get('/', function(req, res){
   res.render('users/index');
});

module.exports = passport;
module.exports = router;
