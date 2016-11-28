var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('mongoose').model('User');

router.get('/register',
    function (req, res) {
        res.render('users/register');
    });

router.post('/register',
    function (req, res) {
        var myUser = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: req.body.password,
            email: req.body.email
        });

        myUser.save(function (err) {
            if (!err)
                res.redirect('/users/login');
        });


    });

router.get('/login',
    function (req, res) {
        res.render('users/login', {message: req.flash('error')});
    });

// router.post('/login',
//     passport.authenticate('local', {
//         failureRedirect: '/users/login',
//         successRedirect: '/',
//         badRequestMessage : 'Missing email or password.',
//         failureFlash: true
//     }),
//     function (req, res) {
//
//         res.redirect('/');
//     });

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err); // will generate a 500 error
        }
        // Generate a JSON response reflecting authentication status
        if (!user) {
            return res.render('users/login', {success: false, message: 'Authentication failed'});
        }
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/places');
        });
    })(req, res, next);
});


router.get('/logout',
    function (req, res) {
        req.logout();
        res.redirect('/');
    });

router.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('profile', {user: req.user});
    });

module.exports = passport;
module.exports = router;
