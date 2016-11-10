var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Place = require('mongoose').model('Place');


router.get('/', function(req, res){
        Place.find(function (err, places) {
            if (err){
                return console.error(err);
            }

            res.render('places/index', {places: places});
        });

});

router.get('/add', function(req, res){

        res.render('places/add');

});

router.post('/add', upload.array('photos', 12), function(req, res){
    var myPlace = new Place({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        email: req.body.email
    });

    myPlace.save(function (err) {
        if (!err)
            res.redirect('places/index');
    });



});

module.exports = router;
