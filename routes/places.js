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

module.exports = router;
