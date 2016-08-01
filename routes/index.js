var router = require('express').Router();

console.log("Loading index routes");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

module.exports = router;
