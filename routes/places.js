var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var router = express.Router();
var Place = require('mongoose').model('Place');
var User = require('mongoose').model('User');
var path = require('path');
var crypto = require('crypto');
var moment = require('moment');

var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);

            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
});

var upload = multer({storage: storage});

router.get('/', function (req, res) {


    Place.find({}, function (err, places) {
        if (err) {
            return console.error(err);
        }

    }).sort({'created': -1})
        .limit(50)
        .exec(function (err, places) {
            if (err) {
                return console.error(err);
            }

            res.render('places/index', {places: places});
        });

});

router.get('/add', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {


    res.render('places/add');

});


router.post('/add', upload.any(), require('connect-ensure-login').ensureLoggedIn(), function (req, res) {

    var myPlace = new Place({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        images: []
    });

    req.files.forEach(function (item) {
        myPlace.images.push({filename: item.filename, mimetype: item.mimetype, created: new Date()})
    });

    myPlace.save(function (err, place) {
        if (!err) {

            return res.redirect('/places');
        }

        console.log(err);
    });


});

router.get('/show/:_id', function (req, res) {

    Place.findOne({'_id': req.params._id})
    // .populate('_userId') -- it doesn't work
        .exec(function (err, place) {
            if (err) {
                return console.log(err);
            }

            User.findOne({'_id': place._userId}, function (err, user) {
                if (err) {
                    return console.log(err);
                }
                place._userId = user;
            });

            res.render('places/show', {place: place, moment: moment});
        });
});

router.get('/edit/:_id', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {


    Place.findOne({'_id': req.params._id})
        .exec(function (err, place) {
            if (err) {
                return console.error(err);
            }

            res.render('places/edit', {place: place});

        });

});

router.post('/edit/:_id', upload.any(), require('connect-ensure-login').ensureLoggedIn(), function (req, res) {

    Place.findOne({'_id': req.params._id}, function (err, place) {
        if (err) {
            return console.error(err);
        }

    })
        .exec(function (err, place) {
            if (err) {
                return console.error(err);
            }

            req.files.forEach(function (item) {
                place.images.push({filename: item.filename, mimetype: item.mimetype, created: new Date()})
            });

            place.name = req.body.name;
            place.description = req.body.description;
            place.longitude = req.body.longitude;
            place.latitude = req.body.latitude;

            place.save(function (err, place) {
                if (!err) {
                    return res.redirect('/places');
                }

                res.render('places/show', {place: place, moment: moment});
            });

        console.log(err);
    });


});

router.get('/list', function (req, res) {
    Place.find({}, function (err, places) {
        if (err) {
            return console.error(err);
        }

    }).sort({'created': -1})
        .limit(50)
        .exec(function (err, places) {
            if (err) {
                return console.error(err);
            }

            res.render('places/list', {places: places});
        });
});

router.post('/show/:_id', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {

    Place.findOne({'_id': req.params._id}, function (err, place) {
        if (err) {
            req.flash('error_messages', "Error: Place has not been found! Try again.");
            return res.redirect('/');
        }

    })
        .populate('_userId')
        .exec(function (err, place) {
            if (err) {
                req.flash('error_messages', "Error: Place has not been found! Try again.");
                return res.redirect('/');
            }

            place.comments.push({
                _userId: req.user._id,
                content: req.body.comment,
                created: new Date(),
                modified: new Date()
            });

            place.save(function (err, place) {
                if (!err) {
                    req.flash('success_messages', "Comment has been saved! Thank you.");
                    return res.render('places/show', {place: place, moment: moment});
                }
                req.flash('error_messages', "Error occured during saving your comment: " + err.message);
                return res.render('places/show', {place: place, moment: moment});
            });

        });
});

module.exports = upload;
module.exports = router;
