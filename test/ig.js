var ig = require('instagram-node').instagram()

console.log("AT:", process.env.AT);
console.log("ID:", process.env.ID);
console.log("INSTAGRAM_CLIENT_ID:", process.env.INSTAGRAM_CLIENT_ID);
console.log("INSTAGRAM_CLIENT_SECRET:", process.env.INSTAGRAM_CLIENT_SECRET);

ig.use({ access_token: process.env.AT });
ig.user_follows(process.env.ID, function(err, users, pagination, remaining, limit) {
	console.log("err", err);
	console.log("users", users);
	console.log("pagination", pagination);
	console.log("remaining", remaining);
	console.log("limit", limit);
});
