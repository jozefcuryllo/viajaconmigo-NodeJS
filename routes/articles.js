var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var Place = mongoose.model('Place');
var Article = mongoose.model('Article');

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    req.flash('error_messages', "Error: You've no permission to see this page. Please log-in.");
    res.redirect('/users/login');
};

router.get('/', function (req, res) {

    Article.find()
        .populate('_placeId')
        .lean()
        .exec(function (err, articles) {
            if (err) {
                req.flash('error_messages', "Error occured with searching for articles");
                return res.redirect('/');
            }

            res.render('articles/index', {
                articles: articles
            });
        });

});

router.get('/add/:_placeId', isAuthenticated, function (req, res) {
    res.render('articles/add', {_placeId: req.params._placeId});
});

router.get('/edit/:_id',isAuthenticated, function (req, res) {

    Article.findOne({'_id': req.params._id})
        .exec(function (err, article) {
            if (err) {
                return console.error(err);
            }

            res.render('articles/edit', {article: article});

        });

});

router.post('/add/:_placeId', isAuthenticated, function (req, res) {
    console.log(req.body);

    var myArticle = new Article({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        content: req.body.content,
        _userId: req.user._id,
        _placeId: req.params._placeId,
        created: new Date(),
        modified: new Date()

    });


    myArticle.save(function (err, article) {
        if (err) {
            req.flash('error_messages', "Error occured with saving article. Try again!");
            console.log(err);
            return res.redirect('/articles');
        }

        req.flash('success_messages', "You article has been saved succesfully!");
        return res.redirect('/articles');
    });
});

router.post('/edit/:_id', isAuthenticated, function (req, res) {

    Article.findOne({'_id': req.params._id})
        .exec(function(err, article){

                article.name =  req.body.name;
                article.description = req.body.description;
                article.content = req.body.content;
                article._userId = req.user._id;
                article.modified = new Date();


            article.save(function (err, article) {
                if (err) {
                    req.flash('error_messages', "Error occured with saving article. Try again!");
                    console.log(err);
                    return res.redirect('/articles');
                }

                req.flash('success_messages', "You article has been saved succesfully!");
                return res.redirect('/articles');
            });
        });






});

router.get('/show/:_id', function (req, res) {
    Article.findOne({'_id': req.params._id})
        .populate('_placeId')
        .exec(function (err, article) {
            if (err) {
                req.flash('error_messages', "Error occured with searching for article");
                console.log(err);
                return res.redirect('/');
            }

            console.log(article);

            res.render('articles/show', {
                article: article
            });
        });
});

router.get('/show', function (req, res) {
    return res.redirect('/articles');
});

router.get('/edit', function (req, res) {
    return res.redirect('/articles');
});


module.exports = passport;
module.exports = router;
