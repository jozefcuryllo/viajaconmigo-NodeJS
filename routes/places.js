var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var router = express.Router();
var Place = mongoose.model('Place');
var Article = mongoose.model('Article');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
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

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    req.flash('error_messages', "Error: You've no permission to see this page. Please log-in.");
    res.redirect('/users/login');
};

router.get('/', function (req, res) {


    var lastPlace = null;
    var lastArticle = null;

    Place.findOne({}, {}, {}, function(err, post) {
       lastPlace = post;
    });

    Article.findOne({}, {}, {}, function(err, post) {
        lastArticle = post;
    });


    Place.find({}, function (err, places) {
        if (err) {
            return console.error(err);
        }

    })
        .sort({'created': -1})
        .limit(50)
        .exec(function (err, places) {
            if (err) {
                return console.error(err);
            }

            res.render('places/index', {
                places: places,
                lastPlace: lastPlace,
                lastArticle: lastArticle
            });
        });

});

router.get('/add', isAuthenticated, function (req, res) {


    res.render('places/add');

});


router.post('/add', upload.any(), isAuthenticated, function (req, res) {

    var myPlace = new Place({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        images: [],
        comments: []
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

    if (req.params._id) { // difference between / and /:_id
        Place.findOne({'_id': req.params._id})
         .populate('comments._userId')
            .exec(function (err, place) {
                if (err) {
                    return console.log(err);
                }

                if (!place) {
                    req.flash('error_messages', "Error: Place has not been found! Try again.");
                    return res.redirect('/places');
                }


                Article.find({'_placeId': req.params._id}).exec(function (err, articles){
                    if (err){
                        console.log(err);
                    }

                    res.render('places/show', {
                        place: place,
                        moment: moment,
                        articles: articles
                    });

                });


            });
    }
});

router.get('/edit/:_id', isAuthenticated, function (req, res) {


    Place.findOne({'_id': req.params._id})
        .exec(function (err, place) {
            if (err) {
                return console.error(err);
            }

            res.render('places/edit', {place: place});

        });

});

router.post('/edit/:_id', upload.any(), isAuthenticated, function (req, res) {

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




    Place.find({}, function (err, places) { // longitude: { $gt: 1, $lt: 2 }
        if (err) {
            return console.error(err);
        }

    })
        //.limit(50)
        .exec(function (err, places) {
            if (err) {
                return console.error(err);
            }

            var locations = [];
            for (var i=0; i<places.length - 1; i++ ){
                var str = { link: '<a href=/places/show/' + places[i]._id + '>' + places[i].name  + '', latitude:  places[i].latitude , longitude: places[i].longitude};
                locations[i] = str;
            }

            var geoip = require('geoip-lite');
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var geo = geoip.lookup(req.ip);



            res.render('places/list', {
                places: places,
                locations: JSON.stringify(locations),
                geo: geo
            });
        });
});

router.post('/show/:_id', isAuthenticated, function (req, res) {

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

router.get('/search-places/:name', function(req, res){
   Place.find({'name': new RegExp(req.params.name, 'i')}, 'name').exec(function(err, places){
       if (err){
           return res.json(err);
       }



       return res.json(places);
   });
});

module.exports = upload;
module.exports = router;
