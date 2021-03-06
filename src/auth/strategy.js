const { Strategy } = require("passport-local");
const users = require("./users");

/** @public */
const strategy = new Strategy((username, password, done) => {
	if (username in users === false)
		return done(null, null, { message: `User "${username}" is not found` });

	const user = users[username];

	if (user.password !== password)
		return done(null, null, { message: "Passwords do not match!" });

	return done(null, user);
});

module.exports = strategy;
