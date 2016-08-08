var router = require('express').Router();

var socialFunctions = require('../social');
var getYoutubeData = socialFunctions.getYoutubeData;
var getDay = socialFunctions.getDay;
var getWeek = socialFunctions.getWeek;
var getMonth = socialFunctions.getMonth;
var getYear = socialFunctions.getYear;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/integrate', function(req, res, next) {
  res.render('integrate');
});


router.get('/update', (req, res, next) => {
  var socialPromises = Object.keys(socialFunctions).map((socialFunction) => {
    return socialFunctions[key]();
  });

  Promise
    .all(socialPromises)
    .then((allTheDataEver) => {
      console.log("[all the data like ever]", allTheDataEver);
    })
    .catch(console.log.bind(this, "[social function err]"));
})

router.get('/youtube', function(req, res, next) {
  getYoutubeData(req.user.youtube.profile.id)
  .then((data) => {
    // console.log('[ALL VIDEOS]', data.videos);
    var daydata = getDay(data.videos);
    var weekdata = getWeek(data.videos);
    var monthdata = getMonth(data.videos);
    var yeardata = getYear(data.videos);
    res.render('youtube', {
      channelName: req.user.youtube.profile.displayName,
      channel: data.channel,
      daydata,
      weekdata,
      monthdata,
      yeardata
    })
  })
})


module.exports = router;