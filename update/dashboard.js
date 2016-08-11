var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

function getGeneral(id) {
	return new Promise(function(masterResolve, masterReject) {
		var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
		Profile.findOne({userId: id}, function(err, profile) {
			if (err) return next(err);
			platforms = platforms.map(function(p) {
				return new Promise(function(resolve, reject) {
					ProfileSnapshot.find({profileId: profile._id, platform: p})
					.limit(10)
					.exec(function(err, psnaps) {
						if (err) reject(err);
						var followers = [];
						psnaps.forEach(function(psnap) {
							followers.push(psnap.followers);
						})
						resolve({
							type: p,
							data: psnaps,
							followers
						});
					});
				});
			});

			Promise
			.all(platforms)
			.then((results) => {
				snaps = {};
				followers = {};
				recent = {};
				change = {};
				results.forEach(function(result, i) {
					snaps[result.type] = result.data;
					followers[result.type] = result.followers;
					recent[result.type] = result.data[result.data.length - 1];
					if (result.data.length > 1) {
						change[result.type] = parseInt(((result.data[result.data.length - 1].followers - result.data[result.data.length - 2].followers) / result.data[result.data.length - 2].followers) * 100);
					}
				})
				masterResolve({
					snaps: snaps,
					followers: followers,
					recent: recent,
					change: change
				})
			}).catch((err) => console.log(err));
		});
	});
}

function getPosts(id) {
	return new Promise(function(masterResolve, masterReject) {
		var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
		Profile.findOne({userId: id}, function(err, profile) {
			if (err) return next(err);
			platforms = platforms.map(function(p) {
				return new Promise(function(resolve, reject) {
					Post.find({profileId: profile._id, type: p})
					.sort({'date': 1})
					.populate('snapshots')
					.exec(function(err, posts) {
						if (err) reject(err);
						resolve({
							type: p,
							posts: posts
						});
					});
				});
			});
			Promise
			.all(platforms)
			.then((data) => {
				var stats = {};
				data.forEach(function(d) {
					if (!stats[d.type]) {
						stats[d.type] = d.posts;
					}
				})
				masterResolve(stats);
			}).catch((err) => console.log(err));
		});
	});
}

module.exports = {
	getPosts: getPosts,
	getGeneral: getGeneral
}