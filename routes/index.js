var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 return res.redirect('/places/index');
});

module.exports = router;
