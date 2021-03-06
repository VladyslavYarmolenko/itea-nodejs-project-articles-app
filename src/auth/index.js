const passport = require("passport");
const strategy = require("./strategy");
const users = require("./users");

passport.use(strategy);

passport.serializeUser((username, done) => {
	done(null, users[username]);
});

passport.deserializeUser((user, done) => {
	done(null, user.username);
});

module.exports = () => [
	passport.initialize(),
	passport.session(),
];
