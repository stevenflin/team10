var router = require('express').Router();
var passport = require('passport');

console.log("Loading index routes");

/* GET home page. */
router.get('/', function(req, res, next) {

	res.render('index', { title: 'Express' });
});


router.get('/integrate', function(req, res, next) {
	res.render('integrate');
});

// router.get('/auth/vine', vine.login('pleeplace@gmail.com', '0519enter', function (error, client) {
//     // Make an API request
//     client.me(function (error, user) {
//         // Handle failure
//         if (error) {
//             throw new Error(error);
//          }
//         // Handle success
//         res.redirect('/');
//         console.log(user);
//     })
//   }
// ))


module.exports = router;
