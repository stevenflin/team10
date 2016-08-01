var router = require('express').Router();
var passport = require('passport');

console.log("Loading index routes");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/connect/instagram', passport.authorize('instagram', { scope : 'email' }));

router.get('/connect/instagram/callback',
    passport.authorize('instagram', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));



module.exports = router;
