var router = require('express').Router();

console.log("Loading index routes");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/integrate', function(req, res, next) {
	res.render('integrate');
});

module.exports = router;
