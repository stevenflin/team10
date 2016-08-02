var router = require('express').Router();
var passport = require('passport');

console.log("Loading index routes");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

<<<<<<< HEAD
router.get('/integrate', function(req, res, next) {
	res.render('integrate');
});


module.exports = router;
