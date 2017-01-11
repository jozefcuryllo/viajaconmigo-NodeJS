var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var Place = mongoose.model('Place');
var Article = mongoose.model('Article');

router.get('/', function(req, res){

    Article.find({}).exec(function(err, articles){
        if (err) {
            req.flash('error_messages', "Error occured with searching for articles");
            return res.redirect('/');
        }

        res.render('articles/index', {
            articles: articles
        });
    });

});

router.get('/add', function(req, res){
    res.render('articles/add');
});

router.get('/edit/:_id', function(req, res){
    Article.find({'_id': req.params._id}).exec(function(err, article){
        if (err) {
            req.flash('error_messages', "Error occured with searching for articles");
            return res.redirect('/');
        }

        res.render('articles/index', {
            article: article
        });
    });

});


module.exports = passport;
module.exports = router;
