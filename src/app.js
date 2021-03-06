const path = require("path");
const express = require("express");
const router = require("./router");

const app = express();

app.set("view engine", "pug");
app.set("views", path.resolve(__dirname, "views"));

if (app.get("env") === "development")
	app.use("/dev", require("./router/dev"));

app.use("/", router);

module.exports = app;
