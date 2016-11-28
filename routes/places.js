var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var router = express.Router();
var Place = require('mongoose').model('Place');
var path = require('path');
var crypto = require('crypto');

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
        .limit(5)
        .exec(function (err, places) {
            if (err) {
                return console.error(err);
            }
            console.log(places);

            res.render('places/index', {places: places});
        });

});

router.get('/add', function (req, res) {


    res.render('places/add');

});

router.post('/add', upload.any(), function (req, res) {

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

            res.redirect('places/add');
        }

        console.log(err);
    });


});

module.exports = upload;
module.exports = router;
