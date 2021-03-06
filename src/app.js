const path = require("path");
const express = require("express");
const session = require("express-session");
const auth = require("./auth");
const router = require("./router");

const app = express();

app.set("view engine", "pug");
app.set("views", path.resolve(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: process.env.EXPRESS_SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 60_000,
	},
}));

app.use(auth());

if (app.get("env") === "development")
	app.use("/dev", require("./router/dev"));

app.use("/", router);

module.exports = app;
