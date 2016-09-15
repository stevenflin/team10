var facebook = require('./facebook');
var facebookUpdate = facebook.facebookUpdate;

var vine = require('./vine');
var vineUpdate = vine.vineUpdate;

var instagram = require('./ig');
var instagramUpdate = instagram.instagramUpdate;

var twitter = require('./twitter');
var twitterUpdate = twitter.twitterUpdate;

var youtubeFunctions = require('./youtube');
var youtubeUpdate = youtubeFunctions.youtubeUpdate;

var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

var updateDaily = function() {
    // return new Promise(function(resolve, reject) {
        User.find(function(err, users) {
            if (err) return reject(err);
            promises = [];
            users.forEach(function(user) {
                promises.push(instagramUpdate(user) );
                promises.push(youtubeUpdate(user) );
                promises.push(twitterUpdate(user) );
                promises.push(vineUpdate(user) );
                promises.push(facebookUpdate(user) );
            });

            // console.log("AM I HERE");

            Promise
            .all(promises)
            .then(() => {
                console.log("Daily Update Success");
            });
        });
    // });
}

var updateFrequent = function() {
    // return new Promise(function(resolve, reject) {
        User.find(function(err, users) {
            if (err) return reject(err);
            promises = [];
            users.forEach(function(user) {
                var isTwenty = true;
                promises.push(instagramUpdate(user, isTwenty) );
                promises.push(youtubeUpdate(user, isTwenty) );
                promises.push(twitterUpdate(user, isTwenty) );
                promises.push(vineUpdate(user, isTwenty) );
                promises.push(facebookUpdate(user, isTwenty) );
            });

            console.log("AM I HERE");

            Promise
            .all(promises)
            .then(() => {
                console.log("Ten Minute Update Success");
            });
        });
    // });
}

var updateUser = function(user) {
    // return new Promise(function(resolve, reject) {
        promises = [];
        var isTwenty = true;
        promises.push(instagramUpdate(user, isTwenty) );
        promises.push(youtubeUpdate(user, isTwenty) );
        promises.push(twitterUpdate(user, isTwenty) );
        promises.push(vineUpdate(user, isTwenty) );
        promises.push(facebookUpdate(user, isTwenty) );

        Promise
        .all(promises)
        .then(() => {
            console.log("User Update Success");
            user.first_login = false;
            user.save();
        });
    // });
}

var clearProfileSnaps = function() {
    return new Promise(function(resolve, reject) {
        var d = new Date();
        d.setDate(d.getDate() - 30);
        ProfileSnapshot.find({date: {$lt: d}})
        .remove(function(err) {
            if (err) reject(err);
            resolve();
        });
    });
}

var clearPostSnaps = function() {
    return new Promise(function(resolve, reject) {
        var d = new Date();
        d.setDate(d.getDate() - 30);
        PostSnapshot.find({date: {$lt: d}})
        .remove(function(err) {
            if (err) reject(err);
            resolve();
        });
    });
}

module.exports = {
    updateFrequent: updateFrequent,
    updateDaily: updateDaily,
    updateUser: updateUser,
    clearProfileSnaps,
    clearPostSnaps
}